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
                    { upsert: true, new: true, session }
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

export { handleAddCartItem }