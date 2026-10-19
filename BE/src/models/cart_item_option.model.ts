import mongoose from "mongoose"

const cartItemOptionSchema = new mongoose.Schema(
    {
        cartItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CartItem",
            required: true,
        },
        modifierOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ModifierOption",
            required: true,
        },
        groupName: {
            type: String,
            required: true,
        },
        optionName: {
            type: String,
            required: true,
        },
        priceAdjustment: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
)

cartItemOptionSchema.index({ cartItemId: 1, modifierOptionId: 1 }, { unique: true })

const CartItemOption = mongoose.model("CartItemOption", cartItemOptionSchema)

export default CartItemOption