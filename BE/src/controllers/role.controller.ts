import { Request, Response } from "express";
import { handleGetAllRoles } from "../services/role.service";

const getAllRolesAPI = async (req: Request, res: Response) => {
    try {
        const roles = await handleGetAllRoles()

        return res.status(200).json({
            message: "Get all roles successfully!",
            data: roles
        })

    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { getAllRolesAPI }