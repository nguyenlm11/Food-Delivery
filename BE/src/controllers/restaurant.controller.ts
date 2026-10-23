import { Request, Response } from "express"
import { RestaurantParams, RestaurantSearchQuery } from "../interfaces/restaurant.interface"
import { AppError } from "../errors/AppError"
import { handleApproveRestaurant, handleCreateRestaurant, handleDeleteRestaurant, handleGetAllRestaurants, handleGetMyRestaurant, handleGetRestaurantById, handleRejectRestaurant, handleResubmitRestaurantApproval, handleUpdateImageRestaurant, handleUpdateRestaurant, handleUpdateRestaurantStatus } from "../services/restaurant.service"
import { getIO } from "../configs/socket"

const createRestaurantAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id
    const params: RestaurantParams = req.body

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "RESTAURANT_REQUIRED_FIELDS")
    }

    const data = await handleCreateRestaurant(myId, params)

    getIO()
        .emit("restaurant:created", {
            data,
            myId
        })

    return res.status(201).json({
        message: "Create restaurant successfully!",
        data: data
    })
}

const getAllRestaurantsAPI = async (req: Request, res: Response) => {
    const query: RestaurantSearchQuery = req.query

    const data = await handleGetAllRestaurants(query)
    return res.status(200).json({
        message: "Get all restaurants successfully!",
        data: data
    })
}

const getRestaurantByIdAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)

    const data = await handleGetRestaurantById(restaurantId)
    return res.status(200).json({
        message: "Get restaurant successfully!",
        data: data
    })
}

const getMyRestaurantsAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetMyRestaurant(userId)
    return res.status(200).json({
        message: "Get my restaurants successfully!",
        data: data
    })
}

const deleteRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)

    await handleDeleteRestaurant(restaurantId)

    getIO()
        .emit("restaurant:deleted", { restaurantId })

    return res.status(200).json({
        message: "Delete restaurant successfully!",
    })
}

const approveRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)

    await handleApproveRestaurant(restaurantId)

    getIO()
        .emit("restaurant:approved", { restaurantId })

    return res.status(200).json({
        message: "Approve restaurant successfully!"
    })
}

const rejectRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const { rejectionReason } = req.body ?? {}

    await handleRejectRestaurant(restaurantId, rejectionReason)

    getIO()
        .emit("restaurant:rejected", {
            restaurantId,
            rejectionReason
        })

    return res.status(200).json({
        message: "Reject restaurant successfully!"
    })
}

const resubmitRestaurantApprovalAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    await handleResubmitRestaurantApproval(userId)

    getIO().emit("restaurant:resubmitedapproval", { userId })

    return res.status(200).json({
        message: "Re-submit restaurant approval successfully!"
    })
}

const updateRestaurantStatusAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const { status } = req.body ?? {}
    if (!status) {
        throw new AppError("Restaurant status is required!", 400, "RESTAURANT_STATUS_REQUIRED")
    }

    const data = await handleUpdateRestaurantStatus(restaurantId, status)

    getIO()
        .emit("restaurant:statusupdated", {
            restaurantId,
            status
        })

    return res.status(200).json({
        message: "Update restaurant status successfully!",
        data: data
    })
}

const updateRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const params: RestaurantParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateRestaurant(restaurantId, userId, params)

    getIO()
        .emit("restaurant:updated", {
            restaurantId,
            userId,
            data
        })

    return res.status(200).json({
        message: "Update restaurant successfully!",
        data: data
    })
}

const updateImageRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const params: RestaurantParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateImageRestaurant(restaurantId, userId, params)

    getIO()
        .emit("restaurant:updated", {
            restaurantId,
            userId,
            data
        })

    return res.status(200).json({
        message: "Update restaurant successfully!",
        data: data
    })
}

export { createRestaurantAPI, getMyRestaurantsAPI, getAllRestaurantsAPI, getRestaurantByIdAPI, deleteRestaurantAPI, approveRestaurantAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, updateRestaurantStatusAPI, updateRestaurantAPI, updateImageRestaurantAPI }