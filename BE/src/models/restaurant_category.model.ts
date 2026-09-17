import mongoose from "mongoose"

const restaurantCategorySchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        }
    },
    { timestamps: true }
)

restaurantCategorySchema.index(
    { restaurantId: 1, categoryId: 1 },
    { unique: true }
)

const RestaurantCategory = mongoose.model("Restaurant_Category", restaurantCategorySchema)

export default RestaurantCategory