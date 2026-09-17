import { NextFunction, Request, Response } from "express";
import { handleGetAllOwner, handleGetMyOwner, handleGetOwnerById, handleUpdateMyOwner, handleApproveOwner, handleRejectOwner, handleDeleteOwnerById, handleUpdateCitizen, handleResubmitApproval } from "../services/owner.service";
import { AppError } from "../errors/error";
import { CitizenUpdateParams, OwnerUpdateParams } from "../interfaces/interface";

const getAllOwnersAPI = async (req: Request, res: Response) => {
    try {
        const owner = await handleGetAllOwner()

        return res.status(200).json({
            message: "Get all owner successfully",
            data: owner
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const getOwnersByIdAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleGetOwnerById(id)
        return res.status(200).json({
            message: "Get owner successfully",
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

const getMyOwnerAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        const data = await handleGetMyOwner(myId)
        return res.status(200).json({
            message: "Get infomation successfully",
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

const updateMyOwnerAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id
        const params: OwnerUpdateParams = req.body

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("No fields to update!", 400)
        }

        const data = await handleUpdateMyOwner(myId, params)
        return res.status(200).json({
            message: "Update information successfully",
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

const approveOwnerAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)
        await handleApproveOwner(id)

        return res.status(200).json({
            message: "Approve owner successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const rejectOwnerAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)
        const { rejectionReason } = req.body
        await handleRejectOwner(id, rejectionReason)

        return res.status(200).json({
            message: "Reject owner successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({

            message: error.message || "Internal server error",
        })
    }
}

const resubmitApprovalAPI = async (req: Request, res: Response) => {
    try {
        const id = String((req as any).user?.id)
        await handleResubmitApproval(id)

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

const deleteOwnerByIdAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleDeleteOwnerById(id)

        return res.status(200).json({
            message: "Delete owner successfully!",
            data
        })
    } catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const updateCitizenAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id

        if (!userId) {
            throw new AppError("Unauthorized!", 401)
        }

        const params: CitizenUpdateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("No fields to update!", 400)
        }

        const data = await handleUpdateCitizen(userId, params)

        return res.status(200).json({
            message: "Update citizen information successfully!",
            data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { getAllOwnersAPI, getOwnersByIdAPI, getMyOwnerAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, resubmitApprovalAPI, deleteOwnerByIdAPI, updateCitizenAPI }