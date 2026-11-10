import mongoose from "mongoose"

const modifierOptionSchema = new mongoose.Schema(
    {
        modifierGroupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ModifierGroup",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        priceAdjustment: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "DELETED"],
            default: "ACTIVE"
        },
        sortOrder: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
)

modifierOptionSchema.index({ modifierGroupId: 1, name: 1 }, { unique: true })

const ModifierOption = mongoose.model("ModifierOption", modifierOptionSchema)

export default ModifierOption
