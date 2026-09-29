import { Request, Response } from "express"
import { handleCreateCategory, handleGetAllCategories, handleGetCategoryById, handleDeleteCategory, handleRestoreCategory } from "../services/category.service"
import { CategoryParams } from "../interfaces/interface"
import { AppError } from "../errors/error"

const getAllCategoriesAPI = async (req: Request, res: Response) => {
    try {
        const categories = await handleGetAllCategories()

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

        const category = await handleCreateCategory(params)
        return res.status(201).json({
            message: "Create category successfully!",
            data: category
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