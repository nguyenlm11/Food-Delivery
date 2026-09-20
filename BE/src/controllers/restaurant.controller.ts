import { Request, Response } from "express"
import { RestaurantParams, RestaurantSearchQuery } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleApproveRestaurant, handleCreateRestaurant, handleDeleteRestaurant, handleGetAllRestaurants, handleGetRestaurantById, handleRejectRestaurant, handleResubmitRestaurantApproval } from "../services/restaurant.service"

const createRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id
        const params: RestaurantParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400);
        }

        const data = await handleCreateRestaurant(myId, params)
        return res.status(201).json({
            message: "Create new restaurant successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const getAllRestaurantsAPI = async (req: Request, res: Response) => {
    try {
        const query: RestaurantSearchQuery = req.query

        const data = await handleGetAllRestaurants(query)
        return res.status(200).json({
            message: "Get all restaurants successfull",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const getRestaurantByIdAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleGetRestaurantById(id)
        return res.status(200).json({
            message: "Get information successfull",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const deleteRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        const data = await handleDeleteRestaurant(id)

        return res.status(200).json({
            message: "Delete restaurant successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const approveRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        await handleApproveRestaurant(id)

        return res.status(200).json({
            message: "Approve restaurant successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const rejectRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        const { rejectionReason } = req.body

        await handleRejectRestaurant(id, rejectionReason)

        return res.status(200).json({
            message: "Reject restaurant successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const resubmitRestaurantApprovalAPI = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        await handleResubmitRestaurantApproval(id)

        return res.status(200).json({
            message: "Re-submit successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { createRestaurantAPI, getAllRestaurantsAPI, getRestaurantByIdAPI, deleteRestaurantAPI, approveRestaurantAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI }