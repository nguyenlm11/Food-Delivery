import { Request, Response } from "express"
import { handleCreateCategory, handleGetAllCategories, handleGetCategoryById, handleDeleteCategory, handleRestoreCategory } from "../services/category.service"
import { CategoryParams, CategorySearchQuery } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { getIO } from "../configs/socket"

const getAllCategoriesAPI = async (req: Request, res: Response) => {
    try {
        const query = req.query as CategorySearchQuery
        const categories = await handleGetAllCategories(query)

        return res.status(200).json({
            message: "Get all categories successfully!",
            data: categories
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getCategoryByIdAPI = async (req: Request, res: Response) => {
    try {
        const categoryId = String(req.params.categoryId)

        const data = await handleGetCategoryById(categoryId)
        return res.status(200).json({
            message: "Get category information successfully!",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const createCategoryAPI = async (req: Request, res: Response) => {
    try {
        const params: CategoryParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleCreateCategory(params)

        getIO().emit("category:created", {
            categoryId: data._id
        })

        return res.status(201).json({
            message: "Create category successfully!",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteCategoryAPI = async (req: Request, res: Response) => {
    try {
        const categoryId = String(req.params.categoryId)

        await handleDeleteCategory(categoryId)

        getIO().emit("category:deleted", {
            categoryId
        })

        return res.status(200).json({
            message: "Category deleted successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const restoreCategoryAPI = async (req: Request, res: Response) => {
    try {
        const categoryId = String(req.params.categoryId)

        await handleRestoreCategory(categoryId)

        getIO().emit("category:restored", {
            categoryId
        })

        return res.status(200).json({
            message: "Category restored successfully!",
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { getAllCategoriesAPI, getCategoryByIdAPI, createCategoryAPI, deleteCategoryAPI, restoreCategoryAPI }