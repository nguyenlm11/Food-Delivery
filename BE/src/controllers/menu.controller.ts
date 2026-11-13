import { Request, Response } from "express"
import { MenuCreateParams, MenuUpdateParams } from "../interfaces/menu.interface"
import { AppError } from "../errors/AppError"
import { handleCreateMenu, handleDeleteMenu, handleGetMenuById, handleGetRestaurantMenus, handleRestoreMenu, handleUpdateMenu, handleUpdateMenuStatus } from "../services/menu.service"
import { getIO } from "../configs/socket"

const createMenusAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const params: MenuCreateParams = req.body

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "MENU_REQUIRED_FIELDS")
    }

    const data = await handleCreateMenu(restaurantId, userId, role, params)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("menu:created", {
            restaurantId,
            menuIds: data.map(menu => menu._id.toString())
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
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const params: MenuUpdateParams = req.body

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateMenu(menuId, userId, role, params)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:updated", { menuId, status: data.status })

    return res.status(200).json({
        message: "Update menu successfully",
        data: data
    })
}

const deleteMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteMenu(menuId, userId, role)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:deleted", { menuId, status: data.status })

    return res.status(200).json({
        message: "Delete menu successfully"
    })
}

const updateMenuStatusAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const { status } = req.body ?? {}

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateMenuStatus(menuId, userId, role, status)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:updated", { menuId, status: data.status })

    return res.status(200).json({
        message: "Update menu status successfully",
        data: data
    })
}

const restoreMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    const data = await handleRestoreMenu(menuId, userId, role)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:updated", { menuId, status: data.status })

    return res.status(200).json({
        message: "Restore menu successfully",
        data: data
    })
}

export { createMenusAPI, getMenuByIdAPI, getRestaurantMenusAPI, updateMenuAPI, deleteMenuAPI, updateMenuStatusAPI, restoreMenuAPI }