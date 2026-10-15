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
