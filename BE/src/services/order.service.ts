import mongoose from "mongoose"
import { AppError } from "../errors/AppError"
import { QuoteOrderQuery } from "../interfaces/order.interface"
import { Cart, CartItem, CartItemOption } from "../models/cart.model"
import { Address } from "../models/address.model"
import { Restaurant } from "../models/restaurant.model"
import { Voucher } from "../models/voucher.model"
import { handleCalculateShipFee } from "./shipfee.service"

const handleQuoteOrder = async (customerId: string, query: QuoteOrderQuery) => {
    const { restaurantId, addressId, voucherCode } = query

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

    const cart = await Cart.findOne({ userId: customerId, restaurantId })
    const cartItems = cart ? await CartItem.find({ cartId: cart._id }).populate("foodId").lean() : []

    if (cartItems.length === 0) {
        throw new AppError("Your cart is empty!", 400, "ORDER_CART_EMPTY")
    }

    let foodAmount = 0

    for (const cartItem of cartItems) {
        const food = cartItem.foodId as any

        if (!food || food.status !== "ACTIVE") {
            throw new AppError("Some foods in your cart are no longer available!", 400, "ORDER_FOOD_UNAVAILABLE")
        }

        const options = await CartItemOption.find({ cartItemId: cartItem._id }).lean()
        const optionTotal = options.reduce((sum, option) => sum + option.priceAdjustment, 0)
        foodAmount += (food.platformPrice + optionTotal) * cartItem.quantity
    }

    let shipFee = 0

    if (address && address.latitude !== undefined && address.longitude !== undefined) {
        const result = await handleCalculateShipFee(restaurantId, {
            customerLat: Number(address.latitude),
            customerLng: Number(address.longitude)
        })
        shipFee = result.shipfee
    }

    let discountAmount = 0

    if (voucherCode) {
        const voucher = await Voucher.findOne({ code: voucherCode.trim().toUpperCase(), status: "ACTIVE" })

        if (!voucher) {
            throw new AppError("Voucher not found or expired!", 400, "ORDER_VOUCHER_NOT_FOUND")
        }

        const now = new Date()
        const today = now.toISOString().slice(0, 10)
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

        if (voucher.startDate > today || voucher.endDate < today) {
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

        if (base < voucher.minPrice) {
            throw new AppError("This voucher does not apply to your order!", 400, "ORDER_VOUCHER_NOT_APPLICABLE")
        }

        const rawDiscount = voucher.typeDiscount === "PERCENT"
            ? base * (voucher.discountValue / 100)
            : voucher.discountValue

        discountAmount = Math.min(rawDiscount, voucher.maxDiscount ?? rawDiscount, base)
    }

    const totalAmount = Math.max(0, foodAmount - discountAmount + shipFee)

    return {
        foodAmount,
        shipFee,
        discountAmount,
        totalAmount
    }
}

const handleCreateOrder = async () => {

}

export { handleQuoteOrder, handleCreateOrder }
