import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        totalItemCount: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

cartSchema.index({ userId: 1, restaurantId: 1 }, { unique: true })

const Cart = mongoose.model("Cart", cartSchema)

export default Cart