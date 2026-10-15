import mongoose from "mongoose"

const menuFoodModifierGroupSchema = new mongoose.Schema(
    {
        menuFoodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuFood",
            required: true
        },
        modifierGroupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ModifierGroup",
            required: true
        },
        minSelect: {
            type: Number,
            default: 0,
            min: 0
        },
        maxSelect: {
            type: Number,
            default: 1,
            min: 0
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

menuFoodModifierGroupSchema.index(
    { menuFoodId: 1, modifierGroupId: 1 },
    { unique: true }
)

const MenuFoodModifierGroup = mongoose.model("MenuFoodModifierGroup", menuFoodModifierGroupSchema)

export default MenuFoodModifierGroup
