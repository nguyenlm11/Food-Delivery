import { Request, Response } from "express"
import { handleCreateCategory, handleDeleteCategory, handleGetAllCategories, handleGetCategoryById, handleUpdateCategoryStatus } from "../services/category.service"
import { CreateCategoryBody, GetCategoriesQuery } from "../interfaces/category.interface"
import { AppError } from "../errors/AppError"
import { getIO } from "../configs/socket"

const getAllCategoriesAPI = async (req: Request, res: Response) => {
    const query: GetCategoriesQuery = req.query
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
    const body: CreateCategoryBody = req.body

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!!", 400, "CATEGORY_REQUIRED_FIELDS")
    }

    const data = await handleCreateCategory(body)
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

const updateCategoryStatusAPI = async (req: Request, res: Response) => {
    const categoryId = String(req.params.categoryId)
    const body = req.body ?? {}
    const { status } = body

    if (!status) {
        throw new AppError("Category status is required!", 400, "CATEGORY_STATUS_REQUIRED")
    }

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

export { getAllCategoriesAPI, getCategoryByIdAPI, createCategoryAPI, deleteCategoryAPI, updateCategoryStatusAPI }