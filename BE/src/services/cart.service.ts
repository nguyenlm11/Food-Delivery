import mongoose from "mongoose"
import { CartCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import Cart from "../models/cart.model"
import CartItem from "../models/cart_item.model"

const handleAddCartItem = async (userId: string, resId: string, params: CartCreateParams) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    if (!params.items || params.items.length === 0) {
        throw new AppError("Items list cannot be empty!", 400)
    }

    const restaurant = await Restaurant.exists({ _id: resId })

    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404)
    }

    const foodIds = params.items.map(item => item.foodId)
    const validFoodIds = foodIds.filter(id => mongoose.isValidObjectId(id))

    if (validFoodIds.length !== foodIds.length) {
        throw new AppError("One or more Food IDs are invalid!", 400)
    }

    const foods = await Food.find({
        _id: { $in: validFoodIds },
        restaurantId: resId,
        isAvailable: true
    })

    if (foods.length !== validFoodIds.length) {
        throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400)
    }

    const foodPrices = new Map<string, number>(
        foods.map(food => [food._id.toString(), food.platformPrice])
    )

    let updatedCart: any = null
    let finalCartItems: any[] = []
    const session = await mongoose.startSession()

    try {
        await session.withTransaction(async () => {
            let cart = await Cart.findOne({
                userId: userId,
                restaurantId: resId
            }).session(session)

            if (!cart) {
                const [newCart] = await Cart.create([{
                    userId: userId,
                    restaurantId: resId
                }], { session })

                cart = newCart
            }

            for (const item of params.items) {
                const realPrice = foodPrices.get(item.foodId)!
                await CartItem.findOneAndUpdate(
                    { cartId: cart._id, foodId: item.foodId },
                    {
                        $inc: { quantity: item.quantity },
                        $set: { price: realPrice }
                    },
                    { upsert: true, returnDocument: 'after', session }
                )
            }

            const allCartItems = await CartItem.find({ cartId: cart._id }).session(session).lean()
            const totalItemCount = allCartItems.reduce((acc, item) => acc + item.quantity, 0)
            const totalPrice = allCartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)

            cart.totalItemCount = totalItemCount
            cart.totalPrice = totalPrice
            await cart.save({ session })

            updatedCart = cart
            finalCartItems = allCartItems
        })
    }
    finally {
        await session.endSession()
    }

    return {
        ...updatedCart.toObject(),
        items: finalCartItems
    }
}

const handleGetCart = async (userId: string, resId: string) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const cart = await Cart
        .findOne({ userId: userId, restaurantId: resId })
        .select("_id totalItemCount totalPrice")

    if (!cart) {
        throw new AppError("Cart not found!", 404)
    }

    const cartItems = await CartItem
        .find({ cartId: cart._id })
        .populate({
            path: "foodId",
            select: "name image platformPrice isAvailable"
        })

    let recalculatedTotalPrice = 0
    let recalculatedTotalCount = 0

    const formattedItems = []

    for (const item of cartItems) {
        const food = item.foodId as any
        if (!food) continue
        if (food.platformPrice !== item.price) {
            item.price = food.platformPrice
            await item.save()
        }

        recalculatedTotalPrice += item.price * item.quantity
        recalculatedTotalCount += item.quantity

        formattedItems.push({
            cartItemId: item._id,
            foodId: food._id,
            name: food.name,
            image: food.image,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            isAvailable: food.isAvailable
        })
    }

    if (cart.totalPrice !== recalculatedTotalPrice || cart.totalItemCount !== recalculatedTotalCount) {
        cart.totalPrice = recalculatedTotalPrice
        cart.totalItemCount = recalculatedTotalCount
        await cart.save()
    }

    return {
        ...cart.toObject(),
        items: formattedItems
    }
}

const handleRemoveCartItem = async (itemId: string) => {
    if (!mongoose.isValidObjectId(itemId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const session = await mongoose.startSession()

    try {
        await session.withTransaction(async () => {
            const item = await CartItem.findById(itemId).session(session)

            if (!item) {
                throw new AppError("Item not found!", 404)
            }

            const cart = await Cart.findOne({ _id: item.cartId }).session(session)

            if (!cart) {
                throw new AppError("Cart not found!", 404)
            }

            cart.totalPrice -= (item.price * item.quantity)
            cart.totalItemCount -= item.quantity

            await item.deleteOne({ session })
            await cart.save({ session })
        })
    }
    finally {
        await session.endSession()
    }
}

const handleClearCart = async (userId: string, resId: string) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const cart = await Cart.findOne({ userId: userId, restaurantId: resId })

    if (!cart) {
        throw new AppError("Cart not found!", 404)
    }

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            await CartItem.deleteMany({ cartId: cart._id }, { session })
            await Cart.deleteOne({ _id: cart._id }, { session })
        })
    }
    finally {
        await session.endSession()
    }
}

export { handleAddCartItem, handleGetCart, handleRemoveCartItem, handleClearCart }