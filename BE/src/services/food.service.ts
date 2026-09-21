import mongoose from "mongoose"
import { FoodCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import MenuFood from "../models/menu_food.model"
import Menu from "../models/menu.model"

const handleCreateFood = async (resId: string, params: FoodCreateParams) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const { name, description, originalPrice, image, menuIds } = params
    if (!name?.trim() || originalPrice == null || !Array.isArray(menuIds) || menuIds.length === 0) {
        throw new AppError("Missing required fields or invalid menuIds!", 400)
    }

    const uniqueMenuIds = [...new Set(menuIds)]

    const restaurant = await Restaurant.findById(resId)
    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404)
    }

    const validMenus = await Menu.find({ _id: { $in: uniqueMenuIds }, restaurantId: resId })
    if (validMenus.length !== uniqueMenuIds.length) {
        throw new AppError("One or more menu IDs are invalid or don't belong to this restaurant!", 400)
    }

    const session = await mongoose.startSession()
    let createdFood: any
    try {
        await session.withTransaction(async () => {
            const [food] = await Food.create([{
                restaurantId: resId,
                name: name.trim(),
                description: description?.trim(),
                originalPrice: originalPrice,
                platformPrice: originalPrice / (1 - restaurant.commissionRate / 100),
                image: image
            }], { session })

            const menuFoodDocs = uniqueMenuIds.map(menuId => ({ foodId: food._id, menuId }))
            await MenuFood.insertMany(menuFoodDocs, { session })

            createdFood = food
        })
    }
    finally {
        session.endSession()
    }

    return createdFood
}

export { handleCreateFood }