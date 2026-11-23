import mongoose from "mongoose"
import { AppError } from "../errors/AppError"
import { MenuCreateParams, MenusByRestaurantQuery, MenuUpdateParams } from "../interfaces/menu.interface"
import Restaurant from "../models/restaurant.model"
import Menu from "../models/menu.model"
import Food from "../models/food.model"
import { ensureRestaurantAccess } from "./restaurant.service"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"

const handleCreateMenu = async (restaurantId: string, userId: string, role: string, params: MenuCreateParams) => {
    if (!mongoose.isValidObjectId(restaurantId)) {
        throw new AppError("Invalid ID format!", 400, "MENU_INVALID_RESTAURANT_ID")
    }

    const { menus } = params
    if (!Array.isArray(menus) || menus.length === 0) {
        throw new AppError("Menus must be a non-empty array!", 400, "MENU_LIST_REQUIRED")
    }

    await ensureRestaurantAccess(restaurantId, userId, role, "MENU_ACCESS_FORBIDDEN")

    const seenNames = new Set<string>()
    const menuNames: string[] = []

    for (const menu of menus) {
        const trimmedName = menu.name.trim()
        if (!trimmedName) {
            throw new AppError("Menu name is required!", 400, "MENU_NAME_REQUIRED")
        }

        const normalizedName = trimmedName.toLowerCase()
        if (seenNames.has(normalizedName)) {
            throw new AppError("Duplicate menu names in payload are not allowed!", 400, "MENU_DUPLICATE_NAMES")
        }

        seenNames.add(normalizedName)
        menuNames.push(trimmedName)
    }

    const existMenus = await Menu.find({
        restaurantId,
        name: { $in: menuNames }
    })

    if (existMenus.length > 0) {
        throw new AppError("Menu name already exists!", 400, "MENU_NAME_ALREADY_EXISTS")
    }

    const menuDocuments = menus.map(menu => ({
        name: menu.name.trim(),
        description: menu.description?.trim() || "",
        restaurantId,
        status: "ACTIVE"
    }))

    const newMenus = await Menu.insertMany(menuDocuments)

    return newMenus
}

const handleGetMenuById = async (menuId: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid ID format!", 400, "MENU_INVALID_ID")
    }

    const menu = await Menu
        .findById(menuId)
        .select("-__v")
        .populate("restaurantId", "_id name")
        .lean()

    if (!menu) {
        throw new AppError("Menu not found!", 404, "MENU_NOT_FOUND")
    }

    return menu
}

const handleGetRestaurantMenus = async (resId: string, query: MenusByRestaurantQuery = {}) => {
    if (!mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400, "MENU_INVALID_RESTAURANT_ID")
    }

    const isRestaurantExist = await Restaurant.exists({ _id: resId })
    if (!isRestaurantExist) {
        throw new AppError("Restaurant not found!", 404, "MENU_RESTAURANT_NOT_FOUND")
    }

    const search = query.search?.trim()
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = resolveSortField(query.sortBy, ["createdAt", "updatedAt", "name", "status"], "createdAt")
    const sortOrder = resolveSortOrder(query.sortOrder)
    const skip = (page - 1) * limit
    const mongoQuery: Record<string, any> = { restaurantId: resId }

    if (search) {
        mongoQuery.$or = [
            { name: { $regex: search, $options: "i" } },
        ]
    }

    if (query.status !== undefined) {
        mongoQuery.status = query.status
    }
    else {
        mongoQuery.status = { $ne: "DELETED" }
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [menus, total] = await Promise.all([
        Menu
            .find(mongoQuery)
            .select("-__v")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        Menu.countDocuments(mongoQuery)
    ])

    const foodsByMenuId = new Map<string, any[]>()

    if (menus.length > 0) {
        const foods = await Food
            .find({
                menuId: { $in: menus.map(menu => menu._id) },
                status: { $ne: "DELETED" }
            })
            .lean()

        for (const food of foods) {
            const key = food.menuId.toString()
            const group = foodsByMenuId.get(key)

            if (group) {
                group.push(food)
            }
            else {
                foodsByMenuId.set(key, [food])
            }
        }
    }

    const result = menus.map(menu => ({
        ...menu,
        foods: (foodsByMenuId.get(menu._id.toString()) ?? []).slice(0, 3)
    }))

    return {
        menus: result,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleUpdateMenu = async (menuId: string, userId: string, role: string, params: MenuUpdateParams) => {
    const { name, description } = params

    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid ID format!", 400, "MENU_INVALID_ID")
    }

    const menu = await Menu.findById(menuId)

    if (!menu) {
        throw new AppError("Menu not found!", 404, "MENU_NOT_FOUND")
    }

    await ensureRestaurantAccess(menu.restaurantId.toString(), userId, role, "MENU_ACCESS_FORBIDDEN")

    if (name !== undefined) {
        const trimmedName = name.trim()
        const existMenu = await Menu.findOne({
            restaurantId: menu.restaurantId,
            name: trimmedName,
            _id: { $ne: menu._id }
        })

        if (existMenu) {
            throw new AppError("Menu name already exists in this restaurant!", 400, "MENU_NAME_ALREADY_EXISTS")
        }
        menu.name = trimmedName
    }

    if (description !== undefined) {
        menu.description = description.trim()
    }

    await menu.save()

    return menu
}

const handleDeleteMenu = async (menuId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid ID format!", 400, "MENU_INVALID_ID")
    }

    const menu = await Menu.findById(menuId)

    if (!menu) {
        throw new AppError("Menu not found!", 404, "MENU_NOT_FOUND")
    }

    await ensureRestaurantAccess(menu.restaurantId.toString(), userId, role, "MENU_ACCESS_FORBIDDEN")

    if (menu.status === "DELETED") {
        throw new AppError("Menu has already been deleted!", 400, "MENU_ALREADY_DELETED")
    }

    menu.status = "DELETED"

    await menu.save()

    return {
        menuId: menu._id,
        restaurantId: menu.restaurantId,
        status: menu.status
    }
}

const handleUpdateMenuStatus = async (menuId: string, userId: string, role: string, status: string) => {
    if (!mongoose.isValidObjectId(menuId)) {
        throw new AppError("Invalid ID format!", 400, "MENU_INVALID_ID")
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "MENU_INVALID_STATUS")
    }

    const menu = await Menu.findById(menuId)

    if (!menu) {
        throw new AppError("Menu not found!", 404, "MENU_NOT_FOUND")
    }

    await ensureRestaurantAccess(menu.restaurantId.toString(), userId, role, "MENU_ACCESS_FORBIDDEN")

    if (menu.status === "DELETED") {
        if (status !== "ACTIVE") {
            throw new AppError("Menu has been deleted!", 400, "MENU_DELETED")
        }

        const restaurant = await Restaurant.findById(menu.restaurantId).select("_id status").lean()

        if (!restaurant) {
            throw new AppError("Restaurant not found!", 404, "MENU_RESTAURANT_NOT_FOUND")
        }

        if (restaurant.status === "DELETED") {
            throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "MENU_RESTAURANT_DELETED")
        }
    }

    if (menu.status === status) {
        throw new AppError(`Menu is already ${status.toLowerCase()}!`, 400, "MENU_STATUS_UNCHANGED")
    }

    menu.status = status as "ACTIVE" | "INACTIVE"

    await menu.save()

    return {
        menuId: menu._id,
        restaurantId: menu.restaurantId,
        status: menu.status
    }
}

export { handleCreateMenu, handleGetMenuById, handleGetRestaurantMenus, handleUpdateMenu, handleDeleteMenu, handleUpdateMenuStatus }