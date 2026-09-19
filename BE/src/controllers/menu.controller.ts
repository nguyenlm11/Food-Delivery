import { Request, Response } from "express"
import { MenuCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateMenu, handleGetMenuById } from "../services/menu.service"

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

export { createMenusAPI, getMenuByIdAPI }