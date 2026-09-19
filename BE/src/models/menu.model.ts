import mongoose from "mongoose"

const menuSchema = new mongoose.Schema(
    {
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

        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

menuSchema.index(
    { restaurantId: 1, name: 1 },
    { unique: true }
)

const Menu = mongoose.model("Menu", menuSchema)

export default Menu