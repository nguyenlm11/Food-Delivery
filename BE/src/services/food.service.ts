import mongoose from "mongoose"
import { FoodCreateParams, FoodUpdateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import MenuFood from "../models/menu_food.model"
import Menu from "../models/menu.model"
import { handleAttachModifierGroupToFood, handleCreateModifierGroup } from "./modifier.service"

const handleCreateFood = async (resId: string, userId: string, params: FoodCreateParams) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const { name, description, originalPrice, image, menuIds, modifierGroups = [], existingModifierGroupIds = [] } = params

    if (!name?.trim() || originalPrice == null || !Array.isArray(menuIds) || menuIds.length === 0) {
        throw new AppError("Missing required fields or invalid menuIds!", 400)
    }

    if (!Array.isArray(modifierGroups)) {
        throw new AppError("Modifier groups must be an array!", 400)
    }

    if (!Array.isArray(existingModifierGroupIds)) {
        throw new AppError("Existing modifier group IDs must be an array!", 400)
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
    try {
        const createdFood = await session.withTransaction(async () => {
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

            const modifierGroupIds = [...existingModifierGroupIds]
            for (const group of modifierGroups) {
                const createdGroup = await handleCreateModifierGroup(resId, userId, group, session)
                modifierGroupIds.push(createdGroup.modifierGroupId.toString())
            }

            for (const modifierGroupId of modifierGroupIds) {
                await handleAttachModifierGroupToFood(food._id.toString(), userId, { modifierGroupId }, session)
            }

            return food
        })

        if (!createdFood) {
            throw new AppError("Food could not be created!", 500)
        }

        return createdFood
    }
    finally {
        await session.endSession()
    }
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

const handleUpdateFood = async (foodId: string, params: FoodUpdateParams) => {
    if (!mongoose.isValidObjectId(foodId)) {
        throw new AppError("Invalid Food ID format!", 400)
    }

    const food = await Food.findById(foodId)

    if (!food) {
        throw new AppError("Food not found!", 404)
    }

    const restaurant = await Restaurant.findOne({
        _id: food.restaurantId,
    })

    if (!restaurant) {
        throw new AppError("You do not have permission to update this food!", 403)
    }

    const { name, description, originalPrice, image } = params

    if (
        name === undefined &&
        description === undefined &&
        originalPrice === undefined &&
        image === undefined
    ) {
        throw new AppError(
            "At least one field is required to update!",
            400
        )
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new AppError("Food name cannot be empty!", 400)
        }

        food.name = name.trim()
    }

    if (description !== undefined) {
        food.description = description.trim()
    }

    if (originalPrice !== undefined) {
        if (
            typeof originalPrice !== "number" ||
            !Number.isFinite(originalPrice) ||
            originalPrice < 0
        ) {
            throw new AppError("Original price must be a valid number greater than or equal to 0!", 400)
        }

        food.originalPrice = originalPrice

        food.platformPrice =
            originalPrice /
            (1 - restaurant.commissionRate / 100)
    }

    if (image !== undefined) {
        food.image = image.trim()
    }

    await food.save()

    return food
}

const handleGetFoodsByMenu = async (menuId: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid Menu ID format!", 400)
    }

    const menu = await Menu
        .findById(menuId)
        .select("_id name restaurantId isActive")
        .lean()

    if (!menu) {
        throw new AppError("Menu not found!", 404)
    }

    if (!menu.isActive) {
        throw new AppError("Menu is inactive!", 400)
    }

    const menuFoods = await MenuFood
        .find({ menuId })
        .populate({
            path: "foodId",
            select: "-__v -restaurantId"
        })
        .lean()

    const foods = menuFoods
        .map(item => item.foodId)
        .filter(Boolean)

    return {
        menu: {
            _id: menu._id,
            name: menu.name,
            restaurantId: menu.restaurantId,
            isActive: menu.isActive
        },
        foods
    }
}

export { handleCreateFood, handleGetFoodById, handleGetFoodsByRestaurant, handleUpdateFoodStatus, handleUpdateFood, handleGetFoodsByMenu }
