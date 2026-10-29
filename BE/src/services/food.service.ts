import mongoose from "mongoose"
import { FoodCreateParams, FoodUpdateParams } from "../interfaces/food.interface"
import { AppError } from "../errors/AppError"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import Menu from "../models/menu.model"
import { handleAttachModifierGroupToFood, handleCreateModifierGroup } from "./modifier.service"

const handleCreateFood = async (resId: string, userId: string, params: FoodCreateParams) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400, "FOOD_INVALID_RESTAURANT_ID")
    }

    const { name, description, originalPrice, image, menuId, modifierGroups = [], modifierGroupIds = [] } = params

    if (!name?.trim() || originalPrice == null || !menuId) {
        throw new AppError("Missing required fields!", 400, "FOOD_REQUIRED_FIELDS")
    }

    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("One or more menu IDs are invalid or don't belong to this restaurant!", 400, "FOOD_INVALID_MENU_IDS")
    }

    if (!Array.isArray(modifierGroups)) {
        throw new AppError("Modifier groups must be an array!", 400, "FOOD_INVALID_MODIFIER_GROUPS")
    }

    if (!Array.isArray(modifierGroupIds)) {
        throw new AppError("Existing modifier group IDs must be an array!", 400, "FOOD_INVALID_MODIFIER_GROUP_IDS")
    }

    const restaurant = await Restaurant.findById(resId)
    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404, "FOOD_RESTAURANT_NOT_FOUND")
    }

    const validMenu = await Menu.findOne({ _id: menuId, restaurantId: resId })
    if (!validMenu) {
        throw new AppError("One or more menu IDs are invalid or don't belong to this restaurant!", 400, "FOOD_INVALID_MENU_IDS")
    }

    const session = await mongoose.startSession()
    try {
        const createdFood = await session.withTransaction(async () => {
            const [food] = await Food.create([{
                restaurantId: resId,
                menuId,
                name: name.trim(),
                description: description?.trim(),
                originalPrice: originalPrice,
                platformPrice: originalPrice / (1 - restaurant.commissionRate / 100),
                image: image
            }], { session })

            const attachedModifierGroupIds = [...modifierGroupIds]
            for (const group of modifierGroups) {
                const createdGroup = await handleCreateModifierGroup(resId, userId, group, session)
                attachedModifierGroupIds.push(createdGroup.modifierGroupId.toString())
            }

            for (const modifierGroupId of attachedModifierGroupIds) {
                await handleAttachModifierGroupToFood(food._id.toString(), userId, { modifierGroupId }, session)
            }

            return food
        })

        if (!createdFood) {
            throw new AppError("Food could not be created!", 500, "FOOD_CREATION_FAILED")
        }

        return createdFood
    }
    finally {
        await session.endSession()
    }
}

const handleGetFoodById = async (foodId: string) => {
    if (!mongoose.isValidObjectId(foodId)) {
        throw new AppError("Invalid ID format!", 400, "FOOD_INVALID_ID")
    }

    const food = await Food
        .findById(foodId)
        .select("-__v")
        .lean()

    return food
}

const handleGetFoodsByRestaurant = async (resId: string) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400, "FOOD_INVALID_RESTAURANT_ID")
    }

    const restaurant = await Restaurant.exists({ _id: resId })
    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404, "FOOD_RESTAURANT_NOT_FOUND")
    }

    const menus = await Menu
        .find({ restaurantId: resId, isActive: true })
        .select("_id name isActive")
        .lean()

    if (menus.length === 0) {
        return []
    }

    const menuIds = menus.map(menu => menu._id)
    const foods = await Food
        .find({ menuId: { $in: menuIds } })
        .select("-__v -restaurantId")
        .lean()

    return menus.map(menu => ({
        ...menu,
        foods: foods
            .filter(food => food.menuId.toString() === menu._id.toString())
            .map(({ menuId: _menuId, ...food }) => food)
    }))
}

const handleUpdateFoodStatus = async (id: string, isAvailable: boolean) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "FOOD_INVALID_ID")
    }

    const food = await Food.findById(id)

    if (!food) {
        throw new AppError("Food not found!", 404, "FOOD_NOT_FOUND")
    }

    if (food.isAvailable === isAvailable) {
        throw new AppError(`Food is already ${isAvailable ? 'available' : 'unavailable'}!`, 400, "FOOD_STATUS_UNCHANGED")
    }

    food.isAvailable = isAvailable
    await food.save()

    return food
}

const handleUpdateFood = async (foodId: string, params: FoodUpdateParams) => {
    if (!mongoose.isValidObjectId(foodId)) {
        throw new AppError("Invalid ID format!", 400, "FOOD_INVALID_ID")
    }

    const food = await Food.findById(foodId)

    if (!food) {
        throw new AppError("Food not found!", 404, "FOOD_NOT_FOUND")
    }

    const restaurant = await Restaurant.findOne({
        _id: food.restaurantId,
    })

    if (!restaurant) {
        throw new AppError("You do not have permission to update this food!", 403, "FOOD_UPDATE_FORBIDDEN")
    }

    const { name, description, originalPrice, image, menuId } = params

    if (name === undefined && description === undefined && originalPrice === undefined && image === undefined && menuId === undefined) {
        throw new AppError("At least one field is required to update!", 400, "FOOD_UPDATE_FIELDS_REQUIRED")
    }

    if (menuId !== undefined) {
        if (!mongoose.isValidObjectId(menuId)) {
            throw new AppError("One or more menu IDs are invalid or don't belong to this restaurant!", 400, "FOOD_INVALID_MENU_IDS")
        }

        const validMenu = await Menu.findOne({ _id: menuId, restaurantId: food.restaurantId })
        if (!validMenu) {
            throw new AppError("One or more menu IDs are invalid or don't belong to this restaurant!", 400, "FOOD_INVALID_MENU_IDS")
        }

        food.menuId = validMenu._id
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new AppError("Food name cannot be empty!", 400, "FOOD_INVALID_NAME")
        }

        food.name = name.trim()
    }

    if (description !== undefined) {
        food.description = description.trim()
    }

    if (originalPrice !== undefined) {
        if (!Number.isFinite(originalPrice) || originalPrice < 0) {
            throw new AppError("Original price must be a valid number greater than or equal to 0!", 400, "FOOD_INVALID_PRICE")
        }

        food.originalPrice = originalPrice
        food.platformPrice = originalPrice / (1 - restaurant.commissionRate / 100)
    }

    if (image !== undefined) {
        food.image = image.trim()
    }

    await food.save()

    return food
}

const handleGetFoodsByMenu = async (menuId: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid ID format!", 400, "FOOD_INVALID_MENU_ID")
    }

    const menu = await Menu
        .findById(menuId)
        .select("_id name restaurantId isActive")
        .lean()

    if (!menu) {
        throw new AppError("Menu not found!", 404, "FOOD_MENU_NOT_FOUND")
    }

    if (!menu.isActive) {
        throw new AppError("Menu is inactive!", 400, "FOOD_MENU_INACTIVE")
    }

    const foods = await Food
        .find({ menuId })
        .select("-__v -restaurantId -menuId")
        .lean()

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
