import { Request, Response } from "express";
import { handleGetAllUsers } from "../services/user.service";

const getAllUsersAPI = async (req: Request, res: Response) => {
    try {
        const users = await handleGetAllUsers();

        return res.status(200).json({
            message: "Get all users successfully!",
            data: users
        });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        });
    }
}

export { getAllUsersAPI }