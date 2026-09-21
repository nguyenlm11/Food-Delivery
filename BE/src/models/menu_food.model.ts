import mongoose from "mongoose"

const menuFoodSchema = new mongoose.Schema(
    {
        menuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },

        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        }
    },
    {
        timestamps: true
    }
)

menuFoodSchema.index({ menuId: 1, foodId: 1 }, { unique: true })

const MenuFood = mongoose.model("MenuFood", menuFoodSchema)

export default MenuFood