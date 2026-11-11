import { Request, Response } from "express"
import { MenuCreateParams, MenuUpdateParams } from "../interfaces/menu.interface"
import { AppError } from "../errors/AppError"
import { handleCreateMenu, handleDeleteMenu, handleGetMenuById, handleGetRestaurantMenus, handleRestoreMenu, handleUpdateMenu, handleUpdateMenuStatus } from "../services/menu.service"
import { getIO } from "../configs/socket"

const createMenusAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const params: MenuCreateParams = req.body

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "MENU_REQUIRED_FIELDS")
    }

    const data = await handleCreateMenu(restaurantId, params)

    // TODO (cần triển khai FE sau): Customer đang xem nhà hàng cũng cần nhận
    // event này. Hiện FE chưa có chỗ gọi `resource:join` nên Customer chưa vào
    // room `restaurant:{id}`. Cần làm ở FE:
    //   1. Khi vào trang nhà hàng -> socket.emit("resource:join", { type: "restaurant", id: restaurantId })
    //   2. Khi rời trang       -> socket.emit("resource:leave", { type: "restaurant", id: restaurantId })
    // Cùng áp dụng cho `menu:updated`, `menu:deleted`, `food:created`, `food:updated`.
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
    const params: MenuUpdateParams = req.body

    const data = await handleUpdateMenu(menuId, params)

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
    const data = await handleDeleteMenu(menuId)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:deleted", { menuId, status: data.status })

    return res.status(200).json({
        message: "Delete menu successfully"
    })
}

const updateMenuStatusAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)
    const { status } = req.body ?? {}

    const data = await handleUpdateMenuStatus(menuId, status)

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
    const data = await handleRestoreMenu(menuId)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("menu:updated", { menuId, status: data.status })

    return res.status(200).json({
        message: "Restore menu successfully",
        data: data
    })
}

export { createMenusAPI, getMenuByIdAPI, getRestaurantMenusAPI, updateMenuAPI, deleteMenuAPI, updateMenuStatusAPI, restoreMenuAPI }