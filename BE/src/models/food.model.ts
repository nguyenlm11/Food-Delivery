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
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "DELETED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
)

foodSchema.index({ menuId: 1 })

const Food = mongoose.model("Food", foodSchema)

export default Food