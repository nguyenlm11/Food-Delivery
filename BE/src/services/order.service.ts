import mongoose from "mongoose"
import crypto from "node:crypto"
import { AppError } from "../errors/AppError"
import { CancelOrderBody, CreateOrderBody, GetOrdersQuery, OrderStatus } from "../interfaces/order.interface"
import Order from "../models/order.model"
import { Cart, CartItem, CartItemOption } from "../models/cart.model"
import Food from "../models/food.model"
import Menu from "../models/menu.model"
import Address from "../models/address.model"
import Restaurant from "../models/restaurant.model"
import Owner from "../models/owner.model"
import { Driver, DriverEarning } from "../models/driver.model"
import Voucher from "../models/voucher.model"
import VoucherUsage from "../models/voucher_usage.model"
import RestaurantSettlement from "../models/restaurant-settlement.model"
import Wallet from "../models/wallet.model"
import WalletTransaction from "../models/wallet_transaction.model"
import { ensureRestaurantAccess } from "./restaurant.service"
import { handleCalculateShipFee } from "./shipfee.service"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"
import { canTransitionOrder, calculateVoucherDiscount } from "../utils/order.util"
import { isValidDateOnly } from "../utils/date.util"

// Chỉ đi đúng 1 hướng, không nhảy trạng thái tùy ý (xem utils/order.util.ts)

const generateOrderCode = (): string => {
    const now = new Date()
    const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

    return `FD-${datePart}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

const buildOrderItems = async (cartId: mongoose.Types.ObjectId, session: mongoose.ClientSession) => {
    const cartItems = await CartItem
        .find({ cartId })
        .session(session)
        .lean()

    if (cartItems.length === 0) {
        throw new AppError("Your cart is empty!", 400, "ORDER_CART_EMPTY")
    }

    const options = await CartItemOption
        .find({ cartItemId: { $in: cartItems.map(item => item._id) } })
        .session(session)
        .lean()

    const optionsByItem = new Map<string, typeof options>()
    for (const option of options) {
        const key = option.cartItemId.toString()
        const list = optionsByItem.get(key) ?? []
        list.push(option)
        optionsByItem.set(key, list)
    }

    const foodIds = [...new Set(cartItems.map(item => item.foodId.toString()))]

    const foods = await Food
        .find({ _id: { $in: foodIds } })
        .session(session)
        .lean()

    const foodsById = new Map(foods.map(food => [food._id.toString(), food]))

    const menuIds = [...new Set(foods.map(food => food.menuId.toString()))]
    const menus = await Menu
        .find({ _id: { $in: menuIds } })
        .select("_id name")
        .session(session)
        .lean()

    const menuNames = new Map(menus.map(menu => [menu._id.toString(), menu.name]))

    const items = cartItems.map((item) => {
        const food = foodsById.get(item.foodId.toString())

        if (!food || food.status !== "ACTIVE") {
            throw new AppError("Some foods in your cart are no longer available!", 400, "ORDER_FOOD_UNAVAILABLE")
        }

        const itemOptions = optionsByItem.get(item._id.toString()) ?? []
        const optionTotal = itemOptions.reduce((sum, option) => sum + option.priceAdjustment, 0)
        const unitPrice = food.platformPrice + optionTotal

        return {
            foodId: food._id,
            foodName: food.name,
            foodImage: food.image ?? "",
            menuName: menuNames.get(food.menuId.toString()) ?? "",
            unitPrice,
            quantity: item.quantity,
            options: itemOptions.map(option => ({
                modifierOptionId: option.modifierOptionId,
                groupName: option.groupName,
                optionName: option.optionName,
                priceAdjustment: option.priceAdjustment
            })),
            totalPrice: unitPrice * item.quantity
        }
    })

    const foodAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

    return { items, foodAmount }
}

const resolveVoucherDiscount = (voucher: any, foodAmount: number, shipFee: number): number => {
    return calculateVoucherDiscount(
        {
            type: voucher.type,
            typeDiscount: voucher.typeDiscount,
            discountValue: voucher.discountValue,
            maxDiscount: voucher.maxDiscount,
            minPrice: voucher.minPrice
        },
        foodAmount,
        shipFee
    )
}

const handleCreateOrder = async (customerId: string, params: CreateOrderBody) => {
    const { restaurantId, addressId, voucherCode, tipAmount = 0, note = "", paymentMethod } = params

    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(addressId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    if (!["WALLET", "CASH"].includes(paymentMethod)) {
        throw new AppError("Invalid payment method!", 400, "ORDER_INVALID_PAYMENT_METHOD")
    }

    if (!Number.isFinite(tipAmount) || tipAmount < 0) {
        throw new AppError("Tip amount must be 0 or greater!", 400, "ORDER_INVALID_TIP_AMOUNT")
    }

    const session = await mongoose.startSession()

    try {
        const result = await session.withTransaction(async () => {
            const restaurant = await Restaurant.findById(restaurantId).session(session)
            if (!restaurant) {
                throw new AppError("Restaurant not found!", 404, "ORDER_RESTAURANT_NOT_FOUND")
            }
            if (restaurant.status !== "ACTIVE") {
                throw new AppError("This restaurant is not accepting orders right now!", 400, "ORDER_RESTAURANT_INACTIVE")
            }

            const address = await Address.findOne({ _id: addressId, customerId }).session(session)
            if (!address) {
                throw new AppError("Delivery address not found!", 404, "ORDER_ADDRESS_NOT_FOUND")
            }

            const cart = await Cart.findOne({ userId: customerId, restaurantId }).session(session)
            if (!cart) {
                throw new AppError("Your cart is empty!", 400, "ORDER_CART_EMPTY")
            }

            const { items, foodAmount } = await buildOrderItems(cart._id, session)

            const shipFee = await handleCalculateShipFee(restaurantId, {
                customerLat: Number(address.latitude),
                customerLng: Number(address.longitude)
            })

            let discountAmount = 0
            let appliedVoucher: any = null

            if (voucherCode) {
                const voucher = await Voucher
                    .findOne({ code: voucherCode.trim().toUpperCase(), status: "ACTIVE" })
                    .session(session)

                if (!voucher) {
                    throw new AppError("Voucher not found or expired!", 400, "ORDER_VOUCHER_NOT_FOUND")
                }

                const today = new Date().toISOString().slice(0, 10)
                const nowTime = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`

                if (voucher.startDate > today || voucher.endDate < today) {
                    throw new AppError("Voucher is outside its validity period!", 400, "ORDER_VOUCHER_EXPIRED")
                }

                if (nowTime < voucher.startTime || nowTime > voucher.endTime) {
                    throw new AppError("Voucher is not valid at this time!", 400, "ORDER_VOUCHER_OUT_OF_TIME")
                }

                if (voucher.maxQuantity !== null && voucher.usedQuantity >= (voucher.maxQuantity ?? 0)) {
                    throw new AppError("Voucher has reached its usage limit!", 400, "ORDER_VOUCHER_LIMIT_REACHED")
                }

                if (voucher.restaurantId && !voucher.restaurantId.equals(restaurant._id)) {
                    throw new AppError("This voucher does not apply to this restaurant!", 400, "ORDER_VOUCHER_NOT_APPLICABLE")
                }

                discountAmount = resolveVoucherDiscount(voucher, foodAmount, shipFee.shipfee)
                appliedVoucher = voucher
            }

            const totalAmount = Math.max(0, foodAmount - discountAmount + shipFee.shipfee + tipAmount)

            if (paymentMethod === "WALLET") {
                const wallet = await Wallet.findOne({ userId: customerId }).session(session)
                if (!wallet) {
                    throw new AppError("Wallet not found!", 404, "ORDER_WALLET_NOT_FOUND")
                }
                if (wallet.balance < totalAmount) {
                    throw new AppError("Insufficient wallet balance!", 400, "ORDER_INSUFFICIENT_BALANCE")
                }
            }

            const [order] = await Order.create([{
                orderCode: generateOrderCode(),
                customerId,
                restaurantId,
                ownerId: restaurant.ownerId,
                address: {
                    recipientName: address.recipientName ?? "",
                    recipientPhone: address.recipientPhone ?? "",
                    addressLine: address.addressLine,
                    longitude: address.longitude,
                    latitude: address.latitude
                },
                items,
                foodAmount,
                discountAmount,
                shipFee: shipFee.shipfee,
                tipAmount,
                totalAmount,
                commissionRate: restaurant.commissionRate,
                voucherId: appliedVoucher?._id ?? null,
                voucherCode: appliedVoucher?.code ?? null,
                paymentMethod,
                paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PAID",
                status: "PENDING",
                note
            }], { session })

            if (appliedVoucher) {
                await VoucherUsage.create([{
                    voucherId: appliedVoucher._id,
                    userId: customerId,
                    orderId: order._id,
                    discountAmount,
                    status: "RESERVED"
                }], { session })

                appliedVoucher.usedQuantity += 1
                await appliedVoucher.save({ session })
            }

            if (paymentMethod === "WALLET") {
                const wallet = await Wallet.findOne({ userId: customerId }).session(session)
                const balanceBefore = wallet!.balance
                const balanceAfter = balanceBefore - totalAmount

                wallet!.balance = balanceAfter
                await wallet!.save({ session })

                await WalletTransaction.create([{
                    walletId: wallet!._id,
                    type: "PAYMENT",
                    amount: totalAmount,
                    balanceBefore,
                    balanceAfter,
                    status: "SUCCESS",
                    transactionRef: order.orderCode,
                    description: `Thanh toán đơn hàng ${order.orderCode}`
                }], { session })
            }

            // Xoá giỏ hàng sau khi đã chốt đơn (options phải xoá trước vì không cascade)
            const cartItemIds = await CartItem.find({ cartId: cart._id }).select("_id").session(session).lean()
            await CartItemOption.deleteMany({ cartItemId: { $in: cartItemIds.map(item => item._id) } }).session(session)
            await CartItem.deleteMany({ cartId: cart._id }).session(session)
            await cart.deleteOne({ _id: cart._id }).session(session)

            return order
        })

        return result
    }
    finally {
        await session.endSession()
    }
}

const buildOrderScopeFilter = async (filter: Record<string, any>, userId: string, role: string) => {
    if (role === "CUSTOMER") {
        filter.customerId = userId
        return
    }

    if (role === "ADMIN") {
        return
    }

    if (role === "OWNER") {
        const owner = await Owner.findOne({ userId }).select("_id").lean()
        if (!owner) {
            throw new AppError("Owner account not found!", 404, "ORDER_OWNER_NOT_FOUND")
        }

        const ownedRestaurants = await Restaurant.find({ ownerId: owner._id }).select("_id").lean()
        filter.restaurantId = { $in: ownedRestaurants.map(item => item._id) }
        return
    }

    if (role === "RESTAURANT") {
        const ownRestaurant = await Restaurant.findOne({ userId }).select("_id").lean()
        if (!ownRestaurant) {
            throw new AppError("Restaurant account not found!", 404, "ORDER_RESTAURANT_NOT_FOUND")
        }

        filter.restaurantId = ownRestaurant._id
        return
    }

    if (role === "DRIVER") {
        const driver = await Driver.findOne({ userId }).select("_id").lean()
        if (!driver) {
            throw new AppError("Driver profile not found!", 404, "ORDER_DRIVER_NOT_FOUND")
        }

        filter.driverId = driver._id
        return
    }

    throw new AppError("You don't have permission to view orders!", 403, "ORDER_ACCESS_FORBIDDEN")
}

const handleGetOrders = async (query: GetOrdersQuery, userId: string, role: string) => {
    const page = query.page === undefined ? 1 : Number(query.page)
    const requestedLimit = query.limit === undefined ? 10 : Number(query.limit)

    if (!Number.isInteger(page) || page < 1) {
        throw new AppError("Page must be a positive integer!", 400, "ORDER_INVALID_PAGE")
    }
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
        throw new AppError("Limit must be a positive integer!", 400, "ORDER_INVALID_LIMIT")
    }

    const limit = Math.min(100, requestedLimit)
    const skip = (page - 1) * limit
    const sortOrder = resolveSortOrder(query.sortOrder)
    const allowedSortFields = ["createdAt", "updatedAt", "totalAmount", "status"]
    const sortBy = resolveSortField(query.sortBy, allowedSortFields, "createdAt")

    const filter: Record<string, any> = {}

    await buildOrderScopeFilter(filter, userId, role)

    if (query.status !== undefined) {
        if (!["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"].includes(query.status)) {
            throw new AppError("Invalid order status!", 400, "ORDER_INVALID_STATUS")
        }
        filter.status = query.status
    }
    else if (role !== "CUSTOMER" && role !== "ADMIN") {
        // Owner/Restaurant/Driver mặc định không thấy đơn đã hủy
        filter.status = { $ne: "CANCELLED" }
    }

    if (query.paymentMethod !== undefined) {
        if (!["WALLET", "CASH"].includes(query.paymentMethod)) {
            throw new AppError("Invalid payment method!", 400, "ORDER_INVALID_PAYMENT_METHOD")
        }
        filter.paymentMethod = query.paymentMethod
    }

    if (query.paymentStatus !== undefined) {
        if (!["PENDING", "PAID", "FAILED"].includes(query.paymentStatus)) {
            throw new AppError("Invalid payment status!", 400, "ORDER_INVALID_PAYMENT_STATUS")
        }
        filter.paymentStatus = query.paymentStatus
    }

    const search = typeof query.search === "string" ? query.search.trim() : ""
    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        filter.$or = [
            { orderCode: { $regex: escapedSearch, $options: "i" } },
            { "address.recipientName": { $regex: escapedSearch, $options: "i" } },
            { "address.recipientPhone": { $regex: escapedSearch, $options: "i" } }
        ]
    }

    if (query.date !== undefined) {
        const dateStr = typeof query.date === "string" ? query.date.slice(0, 10) : ""

        if (!isValidDateOnly(dateStr)) {
            throw new AppError("Invalid filter date! Use YYYY-MM-DD.", 400, "ORDER_INVALID_FILTER_DATE")
        }

        const start = new Date(`${dateStr}T00:00:00.000Z`)
        const end = new Date(`${dateStr}T23:59:59.999Z`)
        filter.createdAt = { $gte: start, $lte: end }
    }

    if (query.restaurantId) {
        if (!mongoose.isValidObjectId(query.restaurantId)) {
            throw new AppError("Invalid restaurant ID format!", 400, "ORDER_INVALID_RESTAURANT_ID")
        }
        filter.restaurantId = new mongoose.Types.ObjectId(query.restaurantId)
    }

    if (query.customerId) {
        if (!mongoose.isValidObjectId(query.customerId)) {
            throw new AppError("Invalid customer ID format!", 400, "ORDER_INVALID_CUSTOMER_ID")
        }
        filter.customerId = new mongoose.Types.ObjectId(query.customerId)
    }

    if (query.driverId) {
        if (!mongoose.isValidObjectId(query.driverId)) {
            throw new AppError("Invalid driver ID format!", 400, "ORDER_INVALID_DRIVER_ID")
        }
        filter.driverId = new mongoose.Types.ObjectId(query.driverId)
    }

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate("customerId", "fullname phone email")
            .populate("driverId", "userId licensePlate")
            .sort({ [sortBy]: sortOrder, _id: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),

        Order.countDocuments(filter)
    ])

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleGetOrderById = async (orderId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    const order = await Order
        .findById(orderId)
        .populate("customerId", "fullname phone email")
        .populate("restaurantId", "name address")
        .populate("driverId", "userId licensePlate vehicleModel")
        .lean()

    if (!order) {
        throw new AppError("Order not found!", 404, "ORDER_NOT_FOUND")
    }

    const filter: Record<string, any> = {}
    await buildOrderScopeFilter(filter, userId, role)

    const isVisible = Object.entries(filter).every(([key, value]) => {
        const target = (order as any)[key]

        // populate() biến ObjectId thành object, so sánh qua _id
        const targetId = target?._id?.toString() ?? target?.toString()

        if (value && typeof value === "object" && "$in" in (value as any)) {
            return ((value as any).$in as any[]).some(id => id.toString() === targetId)
        }

        return targetId === value?.toString()
    })

    if (!isVisible) {
        throw new AppError("You don't have permission to view this order!", 403, "ORDER_ACCESS_FORBIDDEN")
    }

    return order
}

const releaseVoucher = async (order: any, session: mongoose.ClientSession) => {
    if (!order.voucherId) {
        return
    }

    await VoucherUsage.updateOne(
        { orderId: order._id, status: "RESERVED" },
        { $set: { status: "CANCELLED" } },
        { session }
    )

    await Voucher.updateOne(
        { _id: order.voucherId, usedQuantity: { $gt: 0 } },
        { $inc: { usedQuantity: -1 } },
        { session }
    )
}

const handleUpdateOrderStatus = async (orderId: string, userId: string, role: string, status: OrderStatus) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    if (!["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"].includes(status)) {
        throw new AppError("Invalid order status!", 400, "ORDER_INVALID_STATUS")
    }

    const session = await mongoose.startSession()

    try {
        const order = await session.withTransaction(async () => {
            const current = await Order.findById(orderId).session(session)
            if (!current) {
                throw new AppError("Order not found!", 404, "ORDER_NOT_FOUND")
            }

            const allowedNext = canTransitionOrder(current.status, status)

            if (!allowedNext) {
                throw new AppError(`Cannot change order from ${current.status} to ${status}!`, 400, "ORDER_INVALID_TRANSITION")
            }

            if (status === "CONFIRMED") {
                await ensureRestaurantAccess(current.restaurantId.toString(), userId, role, "ORDER_ACCESS_FORBIDDEN", session)
            }
            else if (status === "DELIVERING" || status === "DELIVERED") {
                const driver = await Driver.findOne({ userId }).select("_id").session(session)
                if (!driver) {
                    throw new AppError("Driver profile not found!", 404, "ORDER_DRIVER_NOT_FOUND")
                }

                if (current.driverId && !current.driverId.equals(driver._id)) {
                    throw new AppError("This order is assigned to another driver!", 403, "ORDER_ACCESS_FORBIDDEN")
                }

                if (status === "DELIVERING" && !current.driverId) {
                    current.driverId = driver._id
                }
            }
            else if (status === "CANCELLED") {
                if (role !== "ADMIN") {
                    throw new AppError("You don't have permission to cancel this order!", 403, "ORDER_ACCESS_FORBIDDEN")
                }
                await releaseVoucher(current, session)
            }

            current.status = status

            if (status === "DELIVERED") {
                current.deliveredAt = new Date()
                current.paymentStatus = "PAID"

                const netSalesAmount = Math.max(0, current.foodAmount - current.discountAmount)
                const commissionAmount = netSalesAmount * (current.commissionRate / 100)

                await RestaurantSettlement.create([{
                    orderId: current._id,
                    restaurantId: current.restaurantId,
                    ownerId: current.ownerId,
                    grossAmount: current.foodAmount,
                    netSalesAmount,
                    commissionRate: current.commissionRate,
                    commissionAmount,
                    restaurantAmount: netSalesAmount - commissionAmount,
                    settlementStatus: "PENDING"
                }], { session })

                if (current.driverId) {
                    const driver = await Driver.findById(current.driverId).select("commissionRate").session(session)
                    const driverRate = driver?.commissionRate ?? 0
                    const baseEarning = current.shipFee * (driverRate / 100)

                    await DriverEarning.create([{
                        orderId: current._id,
                        driverId: current.driverId,
                        deliveryFee: current.shipFee,
                        commissionRate: driverRate,
                        baseEarning,
                        platformAmount: current.shipFee - baseEarning,
                        totalEarning: baseEarning,
                        earningStatus: "PENDING"
                    }], { session })
                }

                if (current.voucherId) {
                    await VoucherUsage.updateOne(
                        { orderId: current._id, status: "RESERVED" },
                        { $set: { status: "USED", usedAt: new Date() } },
                        { session }
                    )
                }
            }

            await current.save({ session })

            return current
        })

        return order
    }
    finally {
        await session.endSession()
    }
}

const handleCancelOrder = async (orderId: string, userId: string, role: string, params: CancelOrderBody) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    const reason = params.reason?.trim()
    if (!reason) {
        throw new AppError("Cancellation reason is required!", 400, "ORDER_CANCEL_REASON_REQUIRED")
    }

    const order = await Order.findById(orderId)
    if (!order) {
        throw new AppError("Order not found!", 404, "ORDER_NOT_FOUND")
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        throw new AppError(`Cannot cancel an order that is ${order.status.toLowerCase()}!`, 400, "ORDER_CANNOT_CANCEL")
    }

    if (role === "CUSTOMER" && order.customerId.toString() !== userId) {
        throw new AppError("You don't have permission to cancel this order!", 403, "ORDER_ACCESS_FORBIDDEN")
    }

    if (role !== "CUSTOMER" && role !== "ADMIN") {
        throw new AppError("You don't have permission to cancel this order!", 403, "ORDER_ACCESS_FORBIDDEN")
    }

    const session = await mongoose.startSession()

    try {
        const cancelled = await session.withTransaction(async () => {
            const current = await Order.findById(orderId).session(session)
            if (!current) {
                throw new AppError("Order not found!", 404, "ORDER_NOT_FOUND")
            }

            if (!["PENDING", "CONFIRMED"].includes(current.status)) {
                throw new AppError(`Cannot cancel an order that is ${current.status.toLowerCase()}!`, 400, "ORDER_CANNOT_CANCEL")
            }

            current.status = "CANCELLED"
            current.cancelledReason = reason
            await current.save({ session })

            await releaseVoucher(current, session)

            if (current.paymentMethod === "WALLET" && current.paymentStatus === "PAID") {
                const wallet = await Wallet.findOne({ userId: current.customerId }).session(session)
                if (wallet) {
                    const balanceBefore = wallet.balance
                    wallet.balance = balanceBefore + current.totalAmount
                    await wallet.save({ session })

                    await WalletTransaction.create([{
                        walletId: wallet._id,
                        type: "REFUND",
                        amount: current.totalAmount,
                        balanceBefore,
                        balanceAfter: wallet.balance,
                        status: "SUCCESS",
                        transactionRef: `REFUND-${current.orderCode}`,
                        description: `Hoàn tiền đơn hàng ${current.orderCode}`
                    }], { session })
                }
            }

            return current
        })

        return cancelled
    }
    finally {
        await session.endSession()
    }
}

export { handleCreateOrder, handleGetOrders, handleGetOrderById, handleUpdateOrderStatus, handleCancelOrder }
