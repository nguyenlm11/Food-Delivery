import { Request, Response } from "express"
import { MenuCreateParams, MenuUpdateParams } from "../interfaces/menu.interface"
import { AppError } from "../errors/AppError"
import { handleCreateMenu, handleDeleteMenu, handleGetMenuById, handleGetRestaurantMenus, handleUpdateMenu } from "../services/menu.service"
import { getIO } from "../configs/socket"

const createMenusAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const params: MenuCreateParams = req.body

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "MENU_REQUIRED_FIELDS")
    }

    const data = await handleCreateMenu(restaurantId, params)

    getIO()
        .emit("menu:created", {
            data,
            restaurantId
        })

    return res.status(201).json({
        message: "Create new menu successfully",
        data: data
    })
}

const getMenuByIdAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)

    const data = await handleGetMenuById(menuId)
    return res.status(200).json({
        message: "Get menu successfully",
        data: data
    })
}

const getRestaurantMenusAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)

    const data = await handleGetRestaurantMenus(restaurantId)
    return res.status(200).json({
        message: "Get menus successfully",
        data
    })
}

const updateMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const params: MenuUpdateParams = req.body

    const data = await handleUpdateMenu(menuId, params)

    getIO()
        .emit("menu:updated", { menuId })

    return res.status(200).json({
        message: "Update menu successfully",
        data: data
    })
}

const deleteMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    await handleDeleteMenu(menuId)

    getIO()
        .emit("menu:deleted", { menuId })

    return res.status(200).json({
        message: "Delete menu successfully"
    })
}

export { createMenusAPI, getMenuByIdAPI, getRestaurantMenusAPI, updateMenuAPI, deleteMenuAPI }