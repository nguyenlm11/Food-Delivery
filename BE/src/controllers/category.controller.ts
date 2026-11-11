import { Request, Response } from "express"
import { handleCreateCategory, handleDeleteCategory, handleGetAllCategories, handleGetCategoryById, handleRestoreCategory, handleUpdateCategoryStatus } from "../services/category.service"
import { CategoryParams, CategorySearchQuery } from "../interfaces/category.interface"
import { AppError } from "../errors/AppError"
import { getIO } from "../configs/socket"

const getAllCategoriesAPI = async (req: Request, res: Response) => {
    const query = req.query as CategorySearchQuery
    const categories = await handleGetAllCategories(query)

    return res.status(200).json({
        message: "Get all categories successfully!",
        data: categories
    })
}

const getCategoryByIdAPI = async (req: Request, res: Response) => {
    const categoryId = String(req.params.categoryId)
    const data = await handleGetCategoryById(categoryId)

    return res.status(200).json({
        message: "Get category information successfully!",
        data: data
    })
}

const createCategoryAPI = async (req: Request, res: Response) => {
    const params: CategoryParams = req.body

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!!", 400, "CATEGORY_REQUIRED_FIELDS")
    }

    const data = await handleCreateCategory(params)
    getIO()
        .to(["admins", "owners", "restaurants"])
        .emit("category:created", {
            categoryId: data._id
        })

    return res.status(201).json({
        message: "Create category successfully!",
        data: data
    })
}

const deleteCategoryAPI = async (req: Request, res: Response) => {
    const categoryId = String(req.params.categoryId)
    const data = await handleDeleteCategory(categoryId)

    getIO()
        .to(["admins", "owners", "restaurants"])
        .emit("category:deleted", {
            categoryId,
            status: data.status
        })

    return res.status(200).json({
        message: "Category deleted successfully!",
    })
}

const restoreCategoryAPI = async (req: Request, res: Response) => {
    const categoryId = String(req.params.categoryId)
    const data = await handleRestoreCategory(categoryId)

    getIO()
        .to(["admins", "owners", "restaurants"])
        .emit("category:updated", {
            categoryId,
            status: data.status
        })

    return res.status(200).json({
        message: "Category restored successfully!",
    })
}

const updateCategoryStatusAPI = async (req: Request, res: Response) => {
    const categoryId = String(req.params.categoryId)
    const { status } = req.body ?? {}

    const data = await handleUpdateCategoryStatus(categoryId, status)

    getIO()
        .to(["admins", "owners", "restaurants"])
        .emit("category:updated", {
            categoryId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update category status successfully!",
        data: data
    })
}

export { getAllCategoriesAPI, getCategoryByIdAPI, createCategoryAPI, deleteCategoryAPI, restoreCategoryAPI, updateCategoryStatusAPI }