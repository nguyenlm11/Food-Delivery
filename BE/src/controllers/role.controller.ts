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
        return res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
}

export { getAllRolesAPI }