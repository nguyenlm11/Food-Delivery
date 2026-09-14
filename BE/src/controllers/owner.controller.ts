import { Request, Response } from "express";
import { handleGetAllOwner, handleGetMyOwner, handleGetOwnerById } from "../services/owner.service";
import { AppError } from "../errors/error";

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

export { getAllOwnersAPI, getOwnersByIdAPI, getMyOwnerAPI }