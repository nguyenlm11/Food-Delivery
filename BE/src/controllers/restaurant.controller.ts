import { Request, Response } from "express"
import { GetMyRestaurantsQuery, UpdateRestaurantImageBody, CreateRestaurantBody, GetRestaurantsQuery, UpdateRestaurantBody } from "../interfaces/restaurant.interface"
import { AppError } from "../errors/AppError"
import { handleApproveRestaurant, handleCreateRestaurant, handleDeleteRestaurant, handleGetAllRestaurants, handleGetMyRestaurant, handleGetRestaurantById, handleRejectRestaurant, handleResubmitRestaurantApproval, handleUpdateImageRestaurant, handleUpdateRestaurant, handleUpdateRestaurantStatus } from "../services/restaurant.service"
import { getIO } from "../configs/socket"

const createRestaurantAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id
    const body: CreateRestaurantBody = req.body

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "RESTAURANT_REQUIRED_FIELDS")
    }

    const data = await handleCreateRestaurant(myId, body)

    const restaurantId = data?._id?.toString()

    getIO()
        .in(`user:${myId}`)
        .socketsJoin(`restaurant:${restaurantId}`)

    getIO()
        .to(["admins", `user:${myId}`])
        .emit("restaurant:created", { restaurantId })

    return res.status(201).json({
        message: "Create restaurant successfully!",
        data: data
    })
}

const getAllRestaurantsAPI = async (req: Request, res: Response) => {
    const query: GetRestaurantsQuery = req.query

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
    const query: GetMyRestaurantsQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetMyRestaurant(userId, query)
    return res.status(200).json({
        message: "Get my restaurants successfully!",
        data: data
    })
}

const deleteRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteRestaurant(restaurantId, userId, role)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:deleted", { restaurantId, status: data.status })

    return res.status(200).json({
        message: "Delete restaurant successfully!",
    })
}

const approveRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)

    const data = await handleApproveRestaurant(restaurantId)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:updated", {
            restaurantId,
            status: data.status,
            approvalStatus: data.approvalStatus
        })

    return res.status(200).json({
        message: "Approve restaurant successfully!"
    })
}

const rejectRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const body = req.body ?? {}
    const { rejectionReason } = body

    const data = await handleRejectRestaurant(restaurantId, rejectionReason)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:updated", {
            restaurantId,
            status: data.status,
            approvalStatus: data.approvalStatus,
            rejectionReason: data.rejectionReason
        })

    return res.status(200).json({
        message: "Reject restaurant successfully!"
    })
}

const resubmitRestaurantApprovalAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body = req.body ?? {}
    const { restaurantId } = body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    if (!restaurantId) {
        throw new AppError("Restaurant ID is required!", 400, "RESTAURANT_ID_REQUIRED")
    }

    const data = await handleResubmitRestaurantApproval(restaurantId, userId, role)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:updated", {
            restaurantId,
            status: data.status,
            approvalStatus: data.approvalStatus
        })

    return res.status(200).json({
        message: "Re-submit restaurant approval successfully!"
    })
}

const updateRestaurantStatusAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body = req.body ?? {}
    const { status } = body

    if (!status) {
        throw new AppError("Restaurant status is required!", 400, "RESTAURANT_STATUS_REQUIRED")
    }

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateRestaurantStatus(restaurantId, userId, role, status)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:updated", {
            restaurantId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update restaurant status successfully!",
        data: data
    })
}

const updateRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: UpdateRestaurantBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateRestaurant(restaurantId, userId, role, body)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:updated", {
            restaurantId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update restaurant successfully!",
        data: data
    })
}

const updateImageRestaurantAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: UpdateRestaurantImageBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "RESTAURANT_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateImageRestaurant(restaurantId, userId, role, body)

    getIO()
        .to(["admins", `restaurant:${restaurantId}`])
        .emit("restaurant:updated", {
            restaurantId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update restaurant successfully!",
        data: data
    })
}

export { createRestaurantAPI, getMyRestaurantsAPI, getAllRestaurantsAPI, getRestaurantByIdAPI, deleteRestaurantAPI, approveRestaurantAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, updateRestaurantStatusAPI, updateRestaurantAPI, updateImageRestaurantAPI }