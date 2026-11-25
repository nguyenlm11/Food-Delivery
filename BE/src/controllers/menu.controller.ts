import { Request, Response } from "express"
import { CreateMenuBody, GetMenusQuery, UpdateMenuBody } from "../interfaces/menu.interface"
import { AppError } from "../errors/AppError"
import { handleCreateMenu, handleDeleteMenu, handleGetMenuById, handleGetMenus, handleRestoreMenu, handleUpdateMenu, handleUpdateMenuStatus } from "../services/menu.service"
import { getIO } from "../configs/socket"

const createMenusAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: CreateMenuBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "MENU_REQUIRED_FIELDS")
    }

    const data = await handleCreateMenu(userId, role, body)

    getIO()
        .to(`restaurant:${body.restaurantId}`)
        .emit("menu:created", {
            restaurantId: body.restaurantId,
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

const getMenusAPI = async (req: Request, res: Response) => {
    const query: GetMenusQuery = req.query
    const role = (req as any).user?.role

    if (!query.restaurantId && role !== "ADMIN") {
        throw new AppError("restaurantId is required!", 400, "MENU_RESTAURANT_ID_REQUIRED")
    }

    const data = await handleGetMenus(query)
    return res.status(200).json({
        message: "Get menus successfully",
        data
    })
}

const updateMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: UpdateMenuBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateMenu(menuId, userId, role, body)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:updated", { menuId, status: data.status })

    return res.status(200).json({
        message: "Update menu successfully",
        data: data
    })
}

const restoreMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MENU_AUTHENTICATION_REQUIRED")
    }

    const data = await handleRestoreMenu(menuId, userId, role)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:updated", { menuId, status: data.status })

    return res.status(200).json({
        message: "Restore menu successfully!",
        data: data
    })
}

const deleteMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
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
    const body = req.body ?? {}
    const { status } = body

    if (!userId) {
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

export { createMenusAPI, getMenuByIdAPI, getMenusAPI, updateMenuAPI, restoreMenuAPI, deleteMenuAPI, updateMenuStatusAPI }
