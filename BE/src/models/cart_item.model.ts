import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema(
    {
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            required: true
        },

        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
)

cartItemSchema.index({ cartId: 1, foodId: 1 }, { unique: true })

const CartItem = mongoose.model("CartItem", cartItemSchema)

export default CartItem