import { Request, Response } from "express";
import { handleGetAllCategories } from "../services/category.service";

const getAllCategoriesAPI = async (req: Request, res: Response) => {
    try {
        const categories = await handleGetAllCategories()

        res.status(200).json({
            message: "Get all categories successfully",
            data: categories
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { getAllCategoriesAPI }