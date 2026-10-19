import mongoose from "mongoose"

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

export default FoodModifierGroup
