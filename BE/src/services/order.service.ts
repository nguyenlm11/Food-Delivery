import mongoose from "mongoose"
import crypto from "crypto"
import { AppError } from "../errors/AppError"
import { QuoteOrderQuery, CreateOrderBody, PaymentStatus, GetOrdersQuery } from "../interfaces/order.interface"
import { Cart, CartItem, CartItemOption } from "../models/cart.model"
import { Address } from "../models/address.model"
import { Restaurant } from "../models/restaurant.model"
import { Voucher, VoucherUsage } from "../models/voucher.model"
import { Wallet, WalletTransaction } from "../models/wallet.model"
import { Order, OrderItem, OrderItemOption } from "../models/order.model"
import { Owner } from "../models/owner.model"
import { handleCalculateShipFee } from "./shipfee.service"
import { dateToDateOnly, isValidDateOnly } from "../utils/date.util"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"
import { roundAmount } from "../utils/helper"

const generateOrderCode = () => {
    const now = new Date()
    const datePart = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
    const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6)
    return `FD${datePart}${randomPart}`
}

const handleCalculateOrder = async (customerId: string, query: QuoteOrderQuery) => {
    const { restaurantId, addressId, voucherId } = query

    if (!restaurantId) {
        throw new AppError("Missing restaurant ID!", 400, "ORDER_REQUIRED_FIELDS")
    }

    if (!mongoose.isValidObjectId(restaurantId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    const restaurant = await Restaurant.findById(restaurantId)

    if (!restaurant || restaurant.status !== "ACTIVE") {
        throw new AppError("This restaurant is not accepting orders right now!", 400, "ORDER_RESTAURANT_NOT_FOUND")
    }

    const address = addressId
        ? await Address.findOne({ _id: addressId, customerId })
        : await Address.findOne({ customerId, isDefault: true })

    if (addressId && !address) {
        throw new AppError("Address not found!", 404, "ORDER_ADDRESS_NOT_FOUND")
    }

    const cart = await Cart.findOne({ userId: customerId, restaurantId })
    const cartItems = cart ? await CartItem.find({ cartId: cart._id }).populate("foodId").lean() : []

    if (cartItems.length === 0) {
        throw new AppError("Your cart is empty!", 400, "ORDER_CART_EMPTY")
    }

    const itemSnapshots = []
    let foodAmount = 0

    for (const cartItem of cartItems) {
        const food = cartItem.foodId as any

        if (!food || food.status !== "ACTIVE") {
            throw new AppError("Some foods in your cart are no longer available!", 400, "ORDER_FOOD_UNAVAILABLE")
        }

        const options = await CartItemOption.find({ cartItemId: cartItem._id }).lean()
        const optionTotal = options.reduce((sum, option) => sum + option.priceAdjustment, 0)
        const unitPrice = roundAmount(food.platformPrice + optionTotal)

        itemSnapshots.push({
            foodId: food._id,
            foodName: food.name,
            foodImage: food.image ?? "",
            unitPrice,
            quantity: cartItem.quantity,
            totalPrice: roundAmount(unitPrice * cartItem.quantity),
            options: options.map(option => ({
                modifierOptionId: option.modifierOptionId,
                groupName: option.groupName,
                optionName: option.optionName,
                priceAdjustment: option.priceAdjustment
            }))
        })

        foodAmount += unitPrice * cartItem.quantity
    }

    foodAmount = roundAmount(foodAmount)

    let shipFee = 0

    if (address && address.latitude !== undefined && address.longitude !== undefined) {
        const result = await handleCalculateShipFee(restaurantId, {
            customerLat: Number(address.latitude),
            customerLng: Number(address.longitude)
        })
        shipFee = roundAmount(result.shipfee)
    }

    let discountAmount = 0
    let voucher: any = null

    if (voucherId) {
        if (!mongoose.isValidObjectId(voucherId)) {
            throw new AppError("Invalid voucher ID format!", 400, "ORDER_VOUCHER_INVALID_ID")
        }

        voucher = await Voucher.findById(voucherId)

        if (!voucher || voucher.status !== "ACTIVE") {
            throw new AppError("Voucher not found or expired!", 400, "ORDER_VOUCHER_NOT_FOUND")
        }

        const now = new Date()
        const today = dateToDateOnly(now)!
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

        const startDate = typeof voucher.startDate === "string"
            ? (isValidDateOnly(voucher.startDate) ? voucher.startDate : null)
            : dateToDateOnly(voucher.startDate)

        const endDate = typeof voucher.endDate === "string"
            ? (isValidDateOnly(voucher.endDate) ? voucher.endDate : null)
            : dateToDateOnly(voucher.endDate)

        if (!startDate || !endDate || startDate > today || endDate < today) {
            throw new AppError("Voucher is outside its validity period!", 400, "ORDER_VOUCHER_EXPIRED")
        }

        if (currentTime < voucher.startTime || currentTime > voucher.endTime) {
            throw new AppError("Voucher is not valid at this time!", 400, "ORDER_VOUCHER_OUT_OF_TIME")
        }

        if (voucher.maxQuantity != null && voucher.usedQuantity >= voucher.maxQuantity) {
            throw new AppError("Voucher has reached its usage limit!", 400, "ORDER_VOUCHER_LIMIT_REACHED")
        }

        if (voucher.restaurantId && voucher.restaurantId.toString() !== restaurantId) {
            throw new AppError("This voucher does not apply to this restaurant!", 400, "ORDER_VOUCHER_NOT_APPLICABLE")
        }

        const base = voucher.type === "SHIP" ? shipFee : foodAmount

        if (foodAmount < voucher.minPrice) {
            throw new AppError("This voucher does not apply to your order!", 400, "ORDER_VOUCHER_NOT_APPLICABLE")
        }

        const rawDiscount = voucher.typeDiscount === "PERCENT"
            ? base * (voucher.discountValue / 100)
            : voucher.discountValue

        discountAmount = roundAmount(Math.min(rawDiscount, voucher.maxDiscount ?? rawDiscount, base))
    }

    const totalAmount = Math.max(0, roundAmount(foodAmount - discountAmount + shipFee))

    return {
        restaurant,
        address,
        cart,
        itemSnapshots,
        foodAmount,
        shipFee,
        discountAmount,
        totalAmount,
        voucher
    }
}

const handleCreateOrder = async (customerId: string, body: CreateOrderBody) => {
    if (!mongoose.isValidObjectId(body.addressId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    if (!["WALLET", "CASH"].includes(body.paymentMethod)) {
        throw new AppError("Invalid payment method!", 400, "ORDER_INVALID_PAYMENT_METHOD")
    }

    const session = await mongoose.startSession()
    try {
        const order = await session.withTransaction(async () => {
            const { restaurant, address, cart, itemSnapshots, foodAmount, shipFee, discountAmount, totalAmount, voucher } = await handleCalculateOrder(customerId, body)

            let orderCode = generateOrderCode()
            let codeExists = await Order.exists({ orderCode }).session(session)

            while (codeExists) {
                orderCode = generateOrderCode()
                codeExists = await Order.exists({ orderCode }).session(session)
            }

            let paymentStatus: PaymentStatus = "PENDING"

            if (body.paymentMethod === "WALLET") {
                const wallet = await Wallet.findOne({ userId: customerId }).session(session)

                if (!wallet) {
                    throw new AppError("Wallet not found!", 404, "ORDER_WALLET_NOT_FOUND")
                }

                if (wallet.balance < totalAmount) {
                    throw new AppError("Your wallet balance is not enough!", 400, "ORDER_WALLET_INSUFFICIENT_BALANCE")
                }

                const balanceBefore = wallet.balance
                const balanceAfter = roundAmount(balanceBefore - totalAmount)
                wallet.balance = balanceAfter
                await wallet.save({ session })

                await WalletTransaction.create([{
                    walletId: wallet._id,
                    type: "PAYMENT",
                    amount: totalAmount,
                    balanceBefore,
                    balanceAfter,
                    status: "SUCCESS",
                    transactionRef: crypto.randomUUID().replace(/-/g, ""),
                    description: `Thanh toan don hang ${orderCode}`
                }], { session })
                paymentStatus = "PAID"
            }

            const [order] = await Order.create([{
                orderCode,
                customerId,
                restaurantId: restaurant._id,
                ownerId: restaurant.ownerId,
                addressLine: address?.addressLine,
                recipientName: address?.recipientName ?? "",
                recipientPhone: address?.recipientPhone ?? "",
                latitude: address?.latitude,
                longitude: address?.longitude,
                foodAmount,
                discountAmount,
                shipFee,
                tipAmount: 0,
                totalAmount,
                commissionRate: restaurant.commissionRate,
                voucherId: voucher?._id,
                voucherCode: voucher?.code,
                paymentMethod: body.paymentMethod,
                paymentStatus,
                status: "PENDING",
                note: body.note
            }], { session })

            for (const snapshot of itemSnapshots) {
                const [orderItem] = await OrderItem.create([{
                    orderId: order._id,
                    foodId: snapshot.foodId,
                    foodName: snapshot.foodName,
                    foodImage: snapshot.foodImage,
                    unitPrice: snapshot.unitPrice,
                    quantity: snapshot.quantity,
                    totalPrice: snapshot.totalPrice
                }], { session })

                if (snapshot.options.length > 0) {
                    await OrderItemOption.create(snapshot.options.map(option => ({
                        orderItemId: orderItem._id,
                        ...option
                    })), { session, ordered: true })
                }
            }

            if (voucher) {
                voucher.usedQuantity += 1
                await voucher.save({ session })
                await VoucherUsage.create([{
                    voucherId: voucher._id,
                    userId: customerId,
                    orderId: order._id,
                    discountAmount,
                    status: "USED",
                    usedAt: new Date()
                }], { session })
            }

            const cartItems = await CartItem.find({ cartId: cart?._id }).session(session)
            const cartItemIds = cartItems.map(item => item._id)

            await CartItemOption.deleteMany({ cartItemId: { $in: cartItemIds } }, { session })
            await CartItem.deleteMany({ cartId: cart?._id }, { session })
            await cart?.deleteOne({ session })

            const createdItems = await OrderItem.find({ orderId: order._id }).session(session).lean()
            const createdItemIds = createdItems.map(item => item._id)
            const createdOptions = createdItemIds.length > 0
                ? await OrderItemOption.find({ orderItemId: { $in: createdItemIds } }).session(session).lean()
                : []

            const responseItems = createdItems.map(item => {
                const itemOptions = createdOptions.filter(option => option.orderItemId.equals(item._id))
                return {
                    ...item,
                    options: itemOptions
                }
            })

            return {
                ...order.toObject(),
                items: responseItems
            }
        })

        return order
    }
    finally {
        await session.endSession()
    }
}

const handleGetOrderById = async (orderId: string) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid ID format!", 400, "ORDER_INVALID_ID")
    }

    const order = await Order.findById(orderId)
        .populate("restaurantId", "name logoImage")
        .populate("driverId", "fullname phone")
        .lean()

    if (!order) {
        throw new AppError("Order not found!", 404, "ORDER_NOT_FOUND")
    }

    const items = await OrderItem.find({ orderId: order._id }).lean()
    const itemIds = items.map(item => item._id)
    const options = itemIds.length > 0
        ? await OrderItemOption.find({ orderItemId: { $in: itemIds } }).lean()
        : []

    const responseItems = items.map(item => ({
        ...item,
        options: options.filter(option => option.orderItemId.equals(item._id))
    }))

    const restaurant = order.restaurantId as any
    const driver = order.driverId as any

    return {
        ...order,
        restaurantId: restaurant?._id ?? order.restaurantId,
        restaurantName: restaurant?.name,
        restaurantLogo: restaurant?.logoImage,
        driverId: driver?._id,
        driverName: driver?.fullname,
        driverPhone: driver?.phone,
        items: responseItems
    }
}

const handleGetAllOrders = async (query: GetOrdersQuery, userId: string, role: string) => {
    const search = query.search?.trim()
    const status = query.status
    const paymentStatus = query.paymentStatus
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = resolveSortField(query.sortBy, ["createdAt", "updatedAt", "totalAmount", "status"], "createdAt")
    const sortOrder = resolveSortOrder(query.sortOrder)
    const skip = (page - 1) * limit
    const mongoQuery: Record<string, any> = {}

    if (role === "OWNER") {
        const owner = await Owner.findOne({ userId }).select("_id").lean()

        if (!owner) {
            throw new AppError("Owner profile not found!", 403, "ORDER_ACCESS_FORBIDDEN")
        }

        mongoQuery.ownerId = owner._id

        if (query.restaurantId) {
            if (!mongoose.isValidObjectId(query.restaurantId)) {
                throw new AppError("Invalid restaurant ID format!", 400, "ORDER_INVALID_RESTAURANT_ID")
            }

            const ownedRestaurant = await Restaurant.findOne({ _id: query.restaurantId, ownerId: owner._id }).select("_id").lean()
            if (!ownedRestaurant) {
                throw new AppError("You don't have permission to view this restaurant's orders!", 403, "ORDER_ACCESS_FORBIDDEN")
            }

            mongoQuery.restaurantId = ownedRestaurant._id
        }
    }

    if (search) {
        mongoQuery.$or = [
            { orderCode: { $regex: search, $options: "i" } },
            { recipientName: { $regex: search, $options: "i" } },
            { recipientPhone: { $regex: search, $options: "i" } },
        ]
    }

    if (status !== undefined) {
        mongoQuery.status = status
    }

    if (paymentStatus !== undefined) {
        mongoQuery.paymentStatus = paymentStatus
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [orders, total] = await Promise.all([
        Order
            .find(mongoQuery)
            .select("-__v")
            .populate("restaurantId", "name logoImage")
            .populate("driverId", "fullname phone")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(mongoQuery)
    ])

    return {
        orders: orders.map(order => {
            const restaurant = order.restaurantId as any
            const driver = order.driverId as any
            return {
                ...order,
                restaurantId: restaurant?._id ?? order.restaurantId,
                restaurantName: restaurant?.name,
                restaurantLogo: restaurant?.logoImage,
                driverId: driver?._id ?? null,
                driverName: driver?.fullname,
                driverPhone: driver?.phone
            }
        }),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleGetMyOrders = async (customerId: string, query: GetOrdersQuery) => {
    const search = query.search?.trim()
    const status = query.status
    const paymentStatus = query.paymentStatus
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = resolveSortField(query.sortBy, ["createdAt", "updatedAt", "totalAmount", "status"], "createdAt")
    const sortOrder = resolveSortOrder(query.sortOrder)
    const skip = (page - 1) * limit
    const mongoQuery: Record<string, any> = { customerId }

    if (search) {
        mongoQuery.$or = [
            { orderCode: { $regex: search, $options: "i" } },
            { recipientName: { $regex: search, $options: "i" } },
            { recipientPhone: { $regex: search, $options: "i" } },
        ]
    }

    if (status !== undefined) {
        mongoQuery.status = status
    }

    if (paymentStatus !== undefined) {
        mongoQuery.paymentStatus = paymentStatus
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [orders, total] = await Promise.all([
        Order
            .find(mongoQuery)
            .select("-__v")
            .populate("restaurantId", "name logoImage")
            .populate("driverId", "fullname phone")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(mongoQuery)
    ])

    return {
        orders: orders.map(order => {
            const restaurant = order.restaurantId as any
            const driver = order.driverId as any
            return {
                ...order,
                restaurantId: restaurant?._id ?? order.restaurantId,
                restaurantName: restaurant?.name,
                restaurantLogo: restaurant?.logoImage,
                driverId: driver?._id ?? null,
                driverName: driver?.fullname,
                driverPhone: driver?.phone
            }
        }),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export { handleCalculateOrder, handleCreateOrder, handleGetOrderById, handleGetAllOrders, handleGetMyOrders }
