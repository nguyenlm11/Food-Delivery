import { Request, Response } from "express"

import { RestaurantParams, RestaurantSearchQuery, RestaurantStatusUpdateParams } from "../interfaces/interface"

import { AppError } from "../errors/error"

import { handleApproveRestaurant, handleCreateRestaurant, handleDeleteRestaurant, handleGetAllRestaurants, handleGetMyRestaurant, handleGetRestaurantById, handleRejectRestaurant, handleResubmitRestaurantApproval, handleUpdateRestaurantStatus } from "../services/restaurant.service"

const createRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id
        const params: RestaurantParams = req.body

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleCreateRestaurant(myId, params)

        return res.status(201).json({
            message: "Create restaurant successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getAllRestaurantsAPI = async (req: Request, res: Response) => {
    try {
        const query = req.query as RestaurantSearchQuery

        const data = await handleGetAllRestaurants(query)

        return res.status(200).json({
            message: "Get all restaurants successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getRestaurantByIdAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId

        if (typeof restaurantId !== "string") {
            throw new AppError("Invalid restaurant ID!", 400)
        }

        const data = await handleGetRestaurantById(restaurantId)

        return res.status(200).json({
            message: "Get restaurant successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getMyRestaurantsAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        const data = await handleGetMyRestaurant(userId)

        return res.status(200).json({
            message: "Get my restaurants successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId

        if (typeof restaurantId !== "string") {
            throw new AppError("Invalid restaurant ID!", 400)
        }

        const data = await handleDeleteRestaurant(restaurantId)

        return res.status(200).json({
            message: "Delete restaurant successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const approveRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId

        if (typeof restaurantId !== "string") {
            throw new AppError("Invalid restaurant ID!", 400)
        }

        await handleApproveRestaurant(restaurantId)
        return res.status(200).json({
            message: "Approve restaurant successfully!"
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const rejectRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId
        const { rejectionReason } = req.body ?? {}

        if (typeof restaurantId !== "string") {
            throw new AppError("Invalid restaurant ID!", 400)
        }

        if (
            typeof rejectionReason !== "string" ||
            rejectionReason.trim() === ""
        ) {
            throw new AppError("Rejection reason is required!", 400)
        }

        await handleRejectRestaurant(restaurantId, rejectionReason)

        return res.status(200).json({
            message: "Reject restaurant successfully!"
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const resubmitRestaurantApprovalAPI = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = (req as any).user?.id

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        await handleResubmitRestaurantApproval(userId)

        return res.status(200).json({
            message: "Re-submit restaurant approval successfully!"
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateRestaurantStatusAPI = async (
    req: Request,
    res: Response
) => {
    try {
        const restaurantId = req.params.restaurantId
        const { status } = req.body ?? {}
        if (typeof restaurantId !== "string") {
            throw new AppError("Invalid restaurant ID!", 400)
        }
        if (!status) {
            throw new AppError("Restaurant status is required!", 400)
        }

        const params: RestaurantStatusUpdateParams = {
            restaurantId,
            status
        }

        const data = await handleUpdateRestaurantStatus(params)

        return res.status(200).json({
            message: "Update restaurant status successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}


export { createRestaurantAPI, getMyRestaurantsAPI, getAllRestaurantsAPI, getRestaurantByIdAPI, deleteRestaurantAPI, approveRestaurantAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, updateRestaurantStatusAPI }