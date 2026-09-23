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

const handleGetFoodById = async (foodId: string) => {
    if (!mongoose.isValidObjectId(foodId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const food = await Food
        .findById(foodId)
        .select("-__v")
        .lean()

    return food
}

const handleGetFoodsByRestaurant = async (resId: string) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const restaurant = await Restaurant.exists({ _id: resId })
    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404)
    }

    const menus = await Menu
        .find({ restaurantId: resId, isActive: true })
        .select("_id name isActive")
        .lean()

    if (menus.length === 0) {
        return []
    }

    const menuIds = menus.map(m => m._id)
    const menuFoods = await MenuFood
        .find({ menuId: { $in: menuIds } })
        .populate("foodId", "-__v -restaurantId")
        .lean()

    const result = menus.map(menu => ({
        ...menu,
        foods: menuFoods
            .filter(item => item.menuId.toString() === menu._id.toString())
            .map(item => item.foodId)
            .filter(Boolean)
    }))

    return result
}

const handleUpdateFoodStatus = async (id: string, isAvailable: boolean) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const food = await Food.findById(id)

    if (!food) {
        throw new AppError("Food not found!", 404)
    }

    if (food.isAvailable === isAvailable) {
        throw new AppError(`Food is already ${isAvailable ? 'available' : 'unavailable'}!`, 400)
    }

    food.isAvailable = isAvailable
    await food.save()
}

export { handleCreateFood, handleGetFoodById, handleGetFoodsByRestaurant, handleUpdateFoodStatus }