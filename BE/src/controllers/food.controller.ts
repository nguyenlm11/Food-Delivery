import { Request, Response } from "express"
import { CreateFoodBody, GetRestaurantFoodsQuery, UpdateFoodBody } from "../interfaces/food.interface"
import { AppError } from "../errors/AppError"
import { handleCreateFood, handleDeleteFood, handleGetFoodById, handleGetFoodsByMenu, handleGetFoodsByRestaurant, handleUpdateFood, handleUpdateFoodStatus } from "../services/food.service"
import { getIO } from "../configs/socket"

const createFoodAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: CreateFoodBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "FOOD_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "FOOD_REQUIRED_FIELDS")
    }

    const data = await handleCreateFood(restaurantId, userId, role, body)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("food:created", {
            foodId: data._id,
            restaurantId
        })

    return res.status(201).json({
        message: "Create new food successfully!",
        data: data
    })
}

const getFoodByIdAPI = async (req: Request, res: Response) => {
    const foodId = String(req.params.foodId)

    const data = await handleGetFoodById(foodId)
    return res.status(200).json({
        message: "Get food information successfully!",
        data: data
    })
}

const getFoodsByRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const query: GetRestaurantFoodsQuery = req.query

    const data = await handleGetFoodsByRestaurant(restaurantId, query)
    return res.status(200).json({
        message: "Get all foods for restaurant successfully!",
        data: data
    })
}

const updateFoodStatusAPI = async (req: Request, res: Response) => {
    const foodId = String(req.params.foodId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body = req.body ?? {}
    const { status } = body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "FOOD_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateFoodStatus(foodId, userId, role, status)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("food:updated", {
            foodId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update food status successfully!",
        data: data
    })
}

const updateFoodAPI = async (req: Request, res: Response) => {
    const foodId = String(req.params.foodId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: UpdateFoodBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "FOOD_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "FOOD_REQUIRED_FIELDS")
    }

    const data = await handleUpdateFood(foodId, userId, role, body)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("food:updated", { foodId, status: data.status })

    return res.status(200).json({
        message: "Update food successfully!",
        data: data
    })
}

const getFoodsByMenuAPI = async (req: Request, res: Response) => {
    const menuId = String(req.params.menuId)

    const data = await handleGetFoodsByMenu(menuId)
    return res.status(200).json({
        message: "Get all foods for menu successfully!",
        data: data
    })
}

const deleteFoodAPI = async (req: Request, res: Response) => {
    const foodId = String(req.params.foodId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "FOOD_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteFood(foodId, userId, role)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("food:deleted", {
            foodId,
            restaurantId: data.restaurantId,
            status: data.status
        })

    return res.status(200).json({
        message: "Delete food successfully!",
        data: data
    })
}

export { createFoodAPI, getFoodByIdAPI, getFoodsByRestaurantAPI, updateFoodStatusAPI, updateFoodAPI, getFoodsByMenuAPI, deleteFoodAPI }