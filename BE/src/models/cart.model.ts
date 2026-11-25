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
        },
        optionsKey: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

cartItemSchema.index({ cartId: 1, foodId: 1, optionsKey: 1 }, { unique: true })

const CartItem = mongoose.model("CartItem", cartItemSchema)

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

export { Cart, CartItem, CartItemOption }
