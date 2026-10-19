import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        menuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        originalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        platformPrice: {
            type: Number,
            required: true,
            min: 0
        },
        image: {
            type: String,
            default: ""
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

foodSchema.index({ menuId: 1 })

const Food = mongoose.model("Food", foodSchema)

export default Food