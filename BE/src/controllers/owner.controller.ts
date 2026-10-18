import { Request, Response } from "express"
import { handleGetAllOwner, handleGetMyOwner, handleGetOwnerById, handleUpdateMyOwner, handleApproveOwner, handleRejectOwner, handleDeleteOwnerById, handleUpdateCitizen, handleResubmitApproval } from "../services/owner.service"
import { AppError } from "../errors/AppError"
import { CitizenUpdateParams, OwnerSearchQuery, OwnerUpdateParams } from "../interfaces/interface"
import { getIO } from "../configs/socket"

const getAllOwnersAPI = async (req: Request, res: Response) => {
    const query: OwnerSearchQuery = req.query

    const data = await handleGetAllOwner(query)
    return res.status(200).json({
        message: "Get all owners successfully!",
        data: data
    })
}

const getOwnersByIdAPI = async (req: Request, res: Response) => {
    const ownerId = String(req.params.ownerId)

    const data = await handleGetOwnerById(ownerId)
    return res.status(200).json({
        message: "Get owner successfully!",
        data: data
    })
}

const getMyOwnerAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    if (!userId) {
        throw new AppError("Unauthorized!", 401, "OWNER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetMyOwner(userId)
    return res.status(200).json({
        message: "Get my owner information successfully!",
        data: data
    })
}

const updateMyOwnerAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const params: OwnerUpdateParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "OWNER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateMyOwner(userId, params)

    getIO()
        .emit("owner:updated", { userId })

    return res.status(200).json({
        message: "Update owner information successfully!",
        data: data
    })
}

const updateCitizenAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const params: CitizenUpdateParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "OWNER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "OWNER_CITIZEN_FIELDS_REQUIRED")
    }

    const data = await handleUpdateCitizen(userId, params)

    getIO()
        .emit("owner:citizenupdated", { data, userId })

    return res.status(200).json({
        message: "Update citizen information successfully!",
        data: data
    })
}

const resubmitApprovalAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    if (!userId) {
        throw new AppError("Unauthorized!", 401, "OWNER_AUTHENTICATION_REQUIRED")
    }

    await handleResubmitApproval(userId)

    getIO()
        .emit("owner:resubmitedapproval", { userId })

    return res.status(200).json({
        message: "Resubmit owner approval successfully!"
    })
}

const approveOwnerAPI = async (req: Request, res: Response) => {
    const ownerId = String(req.params.ownerId)

    await handleApproveOwner(ownerId)

    getIO()
        .emit("owner:approved", { ownerId })

    return res.status(200).json({
        message: "Approve owner successfully!"
    })
}

const rejectOwnerAPI = async (req: Request, res: Response) => {
    const ownerId = String(req.params.ownerId)
    const { rejectionReason } = req.body ?? {}

    if (!rejectionReason.trim()) {
        throw new AppError("Rejection reason is required!", 400, "OWNER_REJECTION_REASON_REQUIRED")
    }

    await handleRejectOwner(ownerId, rejectionReason)

    getIO()
        .emit("owner:rejected", { ownerId, rejectionReason })

    return res.status(200).json({
        message: "Reject owner successfully!"
    })
}

const deleteOwnerByIdAPI = async (req: Request, res: Response) => {
    const ownerId = String(req.params.ownerId)

    await handleDeleteOwnerById(ownerId)

    getIO()
        .emit("owner:deleted", { ownerId })

    return res.status(200).json({
        message: "Delete owner successfully!",
    })
}

export { getAllOwnersAPI, getOwnersByIdAPI, getMyOwnerAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, resubmitApprovalAPI, deleteOwnerByIdAPI, updateCitizenAPI }