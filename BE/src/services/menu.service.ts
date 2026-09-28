import mongoose from "mongoose"
import { AppError } from "../errors/error"
import { MenuCreateParams, MenuUpdateParams } from "../interfaces/interface"
import Restaurant from "../models/restaurant.model"
import Menu from "../models/menu.model"

const handleCreateMenu = async (restaurantId: string, params: MenuCreateParams) => {
    if (!mongoose.isValidObjectId(restaurantId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const { menus } = params
    if (!Array.isArray(menus) || menus.length === 0) {
        throw new AppError("Menus must be a non-empty array", 400)
    }

    const isRestaurantExist = await Restaurant.findById(restaurantId)
    if (!isRestaurantExist) {
        throw new AppError("Restaurant not found!", 404)
    }

    const seenNames = new Set<string>()
    const menuNames: string[] = []

    for (const menu of menus) {
        const trimmedName = menu.name.trim()
        if (!trimmedName) {
            throw new AppError("Menu name is required", 400)
        }

        const normalizedName = trimmedName.toLowerCase()
        if (seenNames.has(normalizedName)) {
            throw new AppError("Duplicate menu names in payload are not allowed", 400)
        }

        seenNames.add(normalizedName)
        menuNames.push(trimmedName)
    }

    const existMenus = await Menu.find({
        restaurantId,
        name: { $in: menuNames }
    })

    if (existMenus.length > 0) {
        throw new AppError("Menu name already exists in database", 400)
    }

    const menuDocuments = menus.map(menu => ({
        name: menu.name.trim(),
        description: menu.description?.trim() || "",
        restaurantId,
        isActive: true
    }))

    const newMenus = await Menu.insertMany(menuDocuments)

    return newMenus
}

const handleGetMenuById = async (menuId: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const menu = await Menu
        .findById(menuId)
        .select("-__v")
        .populate("restaurantId", "_id name")
        .lean()

    if (!menu) {
        throw new AppError("Menu not found!", 404)
    }

    return menu
}

const handleGetMyRestaurantMenus = async (resId: string) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const isRestaurantExist = await Restaurant.exists({ _id: resId })
    if (!isRestaurantExist) {
        throw new AppError("Restaurant not found!", 404)
    }

    const myMenu = await Menu.find({ restaurantId: resId }).lean()
    return myMenu
}

const handleUpdateMenu = async (menuId: string, params: MenuUpdateParams) => {
    const { name, description } = params

    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid Menu ID format!", 400)
    }

    if (name === undefined && description === undefined) {
        throw new AppError("No fields to update!", 400)
    }

    if (name !== undefined && !name.trim()) {
        throw new AppError("Menu name is required!", 400)
    }

    const menu = await Menu.findById(menuId)

    if (!menu) {
        throw new AppError("Menu not found!", 404)
    }

    if (name !== undefined) {
        const trimmedName = name.trim()

        const existMenu = await Menu.findOne({
            restaurantId: menu.restaurantId,
            name: trimmedName,
            _id: { $ne: menu._id }
        })

        if (existMenu) {
            throw new AppError(
                "Menu name already exists in this restaurant!",
                400
            )
        }

        menu.name = trimmedName
    }

    if (description !== undefined) {
        menu.description = description.trim()
    }

    await menu.save()

    return menu
}

const handleDeleteMenu = async (menuId: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid Menu ID format!", 400)
    }

    const menu = await Menu.findById(menuId)

    if (!menu) {
        throw new AppError("Menu not found!", 404)
    }

    if (!menu.isActive) {
        throw new AppError("Menu is already inactive!", 400)
    }

    menu.isActive = false

    await menu.save()

    return {
        menuId: menu._id,
        isActive: menu.isActive
    }
}

export { handleCreateMenu, handleGetMenuById, handleGetMyRestaurantMenus, handleUpdateMenu, handleDeleteMenu }