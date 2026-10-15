import mongoose from "mongoose"

const modifierGroupSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
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

modifierGroupSchema.index({ restaurantId: 1, name: 1 }, { unique: true })

const ModifierGroup = mongoose.model("ModifierGroup", modifierGroupSchema)

export default ModifierGroup
