import { Request, Response } from "express"
import { FoodCreateParams, FoodUpdateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateFood, handleGetFoodById, handleGetFoodsByMenu, handleGetFoodsByRestaurant, handleUpdateFood, handleUpdateFoodStatus } from "../services/food.service"
import { getIO } from "../configs/socket"

const createFoodAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = String(req.params.restaurantId)
        const params: FoodCreateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleCreateFood(restaurantId, params)

        getIO()
            .emit("food:created", {
                foodId: data._id,
                restaurantId
            })

        return res.status(201).json({
            message: "Create new food successfully!",
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
        const foodId = String(req.params.foodId)

        const data = await handleGetFoodById(foodId)
        return res.status(200).json({
            message: "Get food information successfully!",
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
        const restaurantId = String(req.params.restaurantId)

        const data = await handleGetFoodsByRestaurant(restaurantId)
        return res.status(200).json({
            message: "Get all foods for restaurant successfully!",
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
        const foodId = String(req.params.foodId)
        const { isAvailable } = req.body

        const data = await handleUpdateFoodStatus(foodId, isAvailable)

        getIO().emit("food:statusUpdated", {
            foodId,
            isAvailable
        })

        return res.status(200).json({
            message: "Update food status successfully!",
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

const updateFoodAPI = async (req: Request, res: Response) => {
    try {
        const foodId = String(req.params.foodId)
        const params: FoodUpdateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleUpdateFood(foodId, params)

        getIO().emit("food:updated", {
            foodId
        })

        return res.status(200).json({
            message: "Update food successfully!",
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

const getFoodsByMenuAPI = async (req: Request, res: Response) => {
    try {
        const menuId = String(req.params.menuId)

        const data = await handleGetFoodsByMenu(menuId)
        return res.status(200).json({
            message: "Get all foods for menu successfully!",
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

export { createFoodAPI, getFoodByIdAPI, getFoodsByRestaurantAPI, updateFoodStatusAPI, updateFoodAPI, getFoodsByMenuAPI }