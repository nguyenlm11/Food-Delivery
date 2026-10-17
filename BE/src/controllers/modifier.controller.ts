import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { FoodModifierGroupAttachParams, ModifierGroupCreateParams } from "../interfaces/interface"
import { handleAttachModifierGroupToFood, handleCreateModifierGroup, handleGetRestaurantModifierGroups } from "../services/modifier.service"

const createModifierGroupAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = String(req.params.restaurantId)
        const userId = (req as any).user?.id
        const params: ModifierGroupCreateParams = req.body

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleCreateModifierGroup(restaurantId, userId, params)
        return res.status(201).json({
            message: "Create modifier group successfully!",
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

const getRestaurantModifierGroupsAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = String(req.params.restaurantId)
        const userId = (req as any).user?.id

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        const data = await handleGetRestaurantModifierGroups(restaurantId, userId)
        return res.status(200).json({
            message: "Get restaurant modifier groups successfully!",
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

const attachModifierGroupToFoodAPI = async (req: Request, res: Response) => {
    try {
        const foodId = String(req.params.foodId)
        const userId = (req as any).user?.id
        const params: FoodModifierGroupAttachParams = req.body

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleAttachModifierGroupToFood(foodId, userId, params)
        return res.status(201).json({
            message: "Attach modifier group to food successfully!",
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

export { createModifierGroupAPI, getRestaurantModifierGroupsAPI, attachModifierGroupToFoodAPI }
