import { Request, Response } from "express"

import { handleGetAllOwner, handleGetMyOwner, handleGetOwnerById, handleUpdateMyOwner, handleApproveOwner, handleRejectOwner, handleDeleteOwnerById, handleUpdateCitizen, handleResubmitApproval } from "../services/owner.service"

import { AppError } from "../errors/error"
import { CitizenUpdateParams, OwnerSearchQuery, OwnerUpdateParams } from "../interfaces/interface"
import { getIO } from "../configs/socket"

const getAllOwnersAPI = async (req: Request, res: Response) => {
    try {
        const query = req.query as OwnerSearchQuery
        const data = await handleGetAllOwner(query)

        return res.status(200).json({
            message: "Get all owners successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getOwnersByIdAPI = async (req: Request, res: Response) => {
    try {
        const ownerId = String(req.params.ownerId)

        const data = await handleGetOwnerById(ownerId)

        return res.status(200).json({
            message: "Get owner successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getMyOwnerAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        const data = await handleGetMyOwner(userId)

        return res.status(200).json({
            message: "Get my owner information successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateMyOwnerAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const params: OwnerUpdateParams = req.body

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("No fields to update!", 400)
        }

        const data = await handleUpdateMyOwner(userId, params)

        getIO()
            .emit("owner:updated", {
                userId
            })

        return res.status(200).json({
            message: "Update owner information successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateCitizenAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const params: CitizenUpdateParams = req.body

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleUpdateCitizen(userId, params)
        getIO()
            .emit("owner:citizenupdated", {
                data,
                userId
            })

        return res.status(200).json({
            message: "Update citizen information successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const resubmitApprovalAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        await handleResubmitApproval(userId)

        getIO()
            .emit("owner:resubmitedapproval", {
                userId
            })

        return res.status(200).json({
            message: "Resubmit owner approval successfully!"
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const approveOwnerAPI = async (req: Request, res: Response) => {
    try {
        const ownerId = String(req.params.ownerId)

        await handleApproveOwner(ownerId)

        getIO()
            .emit("owner:approved", {
                ownerId
            })

        return res.status(200).json({
            message: "Approve owner successfully!"
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const rejectOwnerAPI = async (req: Request, res: Response) => {
    try {
        const ownerId = String(req.params.ownerId)

        const { rejectionReason } = req.body

        if (!rejectionReason || typeof rejectionReason !== "string" || !rejectionReason.trim()) {
            throw new AppError("Rejection reason is required!", 400)
        }

        await handleRejectOwner(ownerId, rejectionReason)

        getIO()
            .emit("owner:rejected", {
                ownerId,
                rejectionReason
            })

        return res.status(200).json({
            message: "Reject owner successfully!"
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteOwnerByIdAPI = async (req: Request, res: Response) => {
    try {
        const ownerId = String(req.params.ownerId)

        const data = await handleDeleteOwnerById(ownerId)

        getIO()
            .emit("owner:deleted", {
                ownerId
            })

        return res.status(200).json({
            message: "Delete owner successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export {
    getAllOwnersAPI, getOwnersByIdAPI, getMyOwnerAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, resubmitApprovalAPI, deleteOwnerByIdAPI, updateCitizenAPI
}