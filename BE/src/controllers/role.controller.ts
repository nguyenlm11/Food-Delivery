import { Request, Response } from "express";
import { handleGetAllRoles } from "../services/role.service";

const getAllRolesAPI = async (req: Request, res: Response) => {
    const roles = await handleGetAllRoles()
    return res.status(200).json({
        message: "Get all roles successfully!",
        data: roles
    })
}

export { getAllRolesAPI }