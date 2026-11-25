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

const foodModifierGroupSchema = new mongoose.Schema(
    {
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },
        modifierGroupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ModifierGroup",
            required: true
        }
    },
    {
        timestamps: true
    }
)

foodModifierGroupSchema.index(
    { foodId: 1, modifierGroupId: 1 },
    { unique: true }
)

const FoodModifierGroup = mongoose.model("FoodModifierGroup", foodModifierGroupSchema)

export { ModifierGroup, ModifierOption, FoodModifierGroup }
