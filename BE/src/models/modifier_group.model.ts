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
        minSelect: {
            type: Number,
            required: true,
            min: 0
        },
        maxSelect: {
            type: Number,
            required: true,
            min: 1
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

modifierGroupSchema.index({ restaurantId: 1, name: 1 }, { unique: true })

const ModifierGroup = mongoose.model("ModifierGroup", modifierGroupSchema)

export default ModifierGroup
