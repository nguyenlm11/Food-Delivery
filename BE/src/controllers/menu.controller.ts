import { Request, Response } from "express"
import { MenuCreateParams, MenuUpdateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateMenu, handleDeleteMenu, handleGetMenuById, handleGetMyRestaurantMenus, handleUpdateMenu } from "../services/menu.service"

const createMenusAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)
        const params: MenuCreateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400)
        }

        const data = await handleCreateMenu(id, params)
        return res.status(201).json({
            message: "Create new menu successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getMenuByIdAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleGetMenuById(id)
        return res.status(200).json({
            message: "Get menu successfully",
            data: data
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
        const resId = String(req.params.id)
        const data = await handleGetMyRestaurantMenus(resId)
        return res.status(200).json({
            message: "Get menu successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateMenuAPI = async (req: Request, res: Response) => {
    try {
        const params: MenuUpdateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400)
        }

        const data = await handleUpdateMenu(params)

        return res.status(200).json({
            message: "Update menu successfully",
            data: data
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
        const { menuId } = req.body

        if (!menuId) {
            throw new AppError("Menu ID is required!", 400)
        }

        const data = await handleDeleteMenu(menuId)

        return res.status(200).json({
            message: "Delete menu successfully",
            data: data
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