import { Request, Response } from "express"
import { FoodCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateFood, handleGetFoodById, handleGetFoodsByRestaurant, handleUpdateFoodStatus } from "../services/food.service"

const createFoodAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)
        const params: FoodCreateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400)
        }

        const data = await handleCreateFood(id, params)
        return res.status(201).json({
            message: "Create new food successfully",
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

const getFoodByIdAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleGetFoodById(id)
        return res.status(200).json({
            message: "Get food information successfully",
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

const getFoodsByRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleGetFoodsByRestaurant(id)
        return res.status(200).json({
            message: "Get all foods for restaurant successfully",
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

const updateFoodStatusAPI = async (req: Request, res: Response) => {
    try {
        const { id, isAvailable } = req.body

        await handleUpdateFoodStatus(id, isAvailable)
        return res.status(200).json({
            message: "Update status successfully",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { createFoodAPI, getFoodByIdAPI, getFoodsByRestaurantAPI, updateFoodStatusAPI }