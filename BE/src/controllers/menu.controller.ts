import { Request, Response } from "express"
import { MenuCreateParams, MenuUpdateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateMenu, handleDeleteMenu, handleGetMenuById, handleGetMyRestaurantMenus, handleUpdateMenu } from "../services/menu.service"

const createMenusAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId
        const params: MenuCreateParams = req.body

        if (
            typeof restaurantId !== "string" ||
            restaurantId.trim() === ""
        ) {
            throw new AppError("Restaurant ID is required!", 400)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleCreateMenu(restaurantId, params)

        return res.status(201).json({
            message: "Create new menu successfully",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getMenuByIdAPI = async (req: Request, res: Response) => {
    try {
        const menuId = String(req.params.menuId)

        const data = await handleGetMenuById(menuId)

        return res.status(200).json({
            message: "Get menu successfully",
            data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getMyRestaurantMenusAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId

        if (
            typeof restaurantId !== "string" ||
            restaurantId.trim() === ""
        ) {
            throw new AppError("Restaurant ID is required!", 400)
        }

        const data = await handleGetMyRestaurantMenus(restaurantId)

        return res.status(200).json({
            message: "Get menus successfully",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateMenuAPI = async (req: Request, res: Response) => {
    try {
        const menuId = String(req.params.menuId)
        const params: MenuUpdateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400)
        }

        const data = await handleUpdateMenu(menuId, params)

        return res.status(200).json({
            message: "Update menu successfully",
            data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteMenuAPI = async (req: Request, res: Response) => {
    try {
        const menuId = String(req.params.menuId)

        const data = await handleDeleteMenu(menuId)

        return res.status(200).json({
            message: "Delete menu successfully",
            data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { createMenusAPI, getMenuByIdAPI, getMyRestaurantMenusAPI, updateMenuAPI, deleteMenuAPI }