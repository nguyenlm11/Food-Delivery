import { Request, Response } from "express";
import { handleGetAllOwner } from "../services/owner.service";

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

export { getAllOwnersAPI }