import { Request, Response } from "express"

import { FoodCreateParams, FoodUpdateParams } from "../interfaces/interface"

import { AppError } from "../errors/error"

import { handleCreateFood, handleGetFoodById, handleGetFoodsByMenu, handleGetFoodsByRestaurant, handleUpdateFood, handleUpdateFoodStatus } from "../services/food.service"

const getRouteParam = (
    value: string | string[] | undefined,
    paramName: string
): string => {
    const result = Array.isArray(value) ? value[0] : value

    if (!result) {
        throw new AppError(`${paramName} is required!`, 400)
    }

    return result
}

const createFoodAPI = async (req: Request, res: Response) => {
    try {
        const restaurantIdParam = req.params.restaurantId

        const restaurantId = Array.isArray(restaurantIdParam)
            ? restaurantIdParam[0]
            : restaurantIdParam

        if (!restaurantId) {
            throw new AppError("Restaurant ID is required!", 400)
        }

        const params: FoodCreateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleCreateFood(restaurantId, params)

        return res.status(201).json({
            message: "Create new food successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getFoodByIdAPI = async (req: Request, res: Response) => {
    try {
        const foodId = getRouteParam(req.params.foodId, "Food ID")

        if (!foodId) {
            throw new AppError("Food ID is required!", 400)
        }

        const data = await handleGetFoodById(foodId)

        return res.status(200).json({
            message: "Get food information successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getFoodsByRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const restaurantIdParam = req.params.restaurantId

        const restaurantId = Array.isArray(restaurantIdParam)
            ? restaurantIdParam[0]
            : restaurantIdParam

        if (!restaurantId) {
            throw new AppError("Restaurant ID is required!", 400)
        }

        const data = await handleGetFoodsByRestaurant(restaurantId)

        return res.status(200).json({
            message: "Get all foods for restaurant successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateFoodStatusAPI = async (req: Request, res: Response) => {
    try {
        const foodId = getRouteParam(req.params.foodId, "Food ID")
        const { isAvailable } = req.body ?? {}

        if (!foodId) {
            throw new AppError("Food ID is required!", 400)
        }

        if (typeof isAvailable !== "boolean") {
            throw new AppError("isAvailable must be a boolean!", 400)
        }

        const data = await handleUpdateFoodStatus(foodId, isAvailable)

        return res.status(200).json({
            message: "Update food status successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateFoodAPI = async (req: Request, res: Response) => {
    try {
        const foodId = getRouteParam(req.params.foodId, "Food ID")
        const params: FoodUpdateParams = req.body

        if (!foodId) {
            throw new AppError("Food ID is required!", 400)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleUpdateFood(foodId, params)

        return res.status(200).json({
            message: "Update food successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getFoodsByMenuAPI = async (req: Request, res: Response) => {
    try {
        const menuId = getRouteParam(req.params.menuId, "Menu ID")

        if (!menuId) {
            throw new AppError("Menu ID is required!", 400)
        }

        const data = await handleGetFoodsByMenu(menuId)

        return res.status(200).json({
            message: "Get all foods for menu successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}


export { createFoodAPI, getFoodByIdAPI, getFoodsByRestaurantAPI, updateFoodStatusAPI, updateFoodAPI, getFoodsByMenuAPI }