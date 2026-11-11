import mongoose from "mongoose"
import Category from "../models/category.model"
import { AppError } from "../errors/AppError"
import { CategoryParams, CategorySearchQuery } from "../interfaces/category.interface"

const handleGetAllCategories = async (query: CategorySearchQuery) => {
    const search = query.search?.trim()
    const status = query.status
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? 1 : -1
    const skip = (page - 1) * limit
    const mongoQuery: Record<string, any> = {}

    if (search) {
        mongoQuery.$or = [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
        ]
    }

    if (status !== undefined) {
        mongoQuery.status = status
    }
    else {
        mongoQuery.status = { $ne: "DELETED" }
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [categories, total] = await Promise.all([
        Category
            .find(mongoQuery)
            .select("-__v")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        Category.countDocuments(mongoQuery)
    ])

    return {
        categories: categories,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleGetCategoryById = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "CATEGORY_INVALID_ID")
    }

    const category = await Category
        .findById(id)
        .select("-__v")
        .lean()

    if (!category) {
        throw new AppError("Category not found!", 404, "CATEGORY_NOT_FOUND")
    }

    return category
}

const handleCreateCategory = async (params: CategoryParams) => {
    const { name, iconImage } = params

    if (!name || !iconImage) {
        throw new AppError("Missing required fields!", 400, "CATEGORY_REQUIRED_FIELDS")
    }

    const existName = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } })

    if (existName) {
        throw new AppError("Category name already exists", 400, "CATEGORY_NAME_ALREADY_EXISTS")
    }

    const slug = name
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')

    const category = await Category.create({
        name: name.trim(),
        slug: slug.trim(),
        iconImage: iconImage.trim(),
        status: "ACTIVE"
    })

    return category
}

const handleDeleteCategory = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "CATEGORY_INVALID_ID")
    }

    const category = await Category.findOne({ _id: id })

    if (!category) {
        throw new AppError("Category not found!", 404, "CATEGORY_NOT_FOUND")
    }

    if (category.status === "DELETED") {
        throw new AppError("Category has already been deleted!", 400, "CATEGORY_ALREADY_DELETED")
    }

    category.status = "DELETED"

    await category.save()

    return {
        categoryId: category._id,
        status: category.status
    }
}

const handleUpdateCategoryStatus = async (id: string, status: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "CATEGORY_INVALID_ID")
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "CATEGORY_INVALID_STATUS")
    }

    const category = await Category.findOne({ _id: id })

    if (!category) {
        throw new AppError("Category not found!", 404, "CATEGORY_NOT_FOUND")
    }

    if (category.status === "DELETED") {
        throw new AppError("Category has been deleted!", 400, "CATEGORY_DELETED")
    }

    if (category.status === status) {
        throw new AppError(`Category is already ${status.toLowerCase()}!`, 400, "CATEGORY_STATUS_UNCHANGED")
    }

    category.status = status as "ACTIVE" | "INACTIVE"

    await category.save()

    return category
}

const handleRestoreCategory = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "CATEGORY_INVALID_ID")
    }

    const category = await Category.findOne({ _id: id })

    if (!category) {
        throw new AppError("Category not found!", 404, "CATEGORY_NOT_FOUND")
    }

    if (category.status === "ACTIVE") {
        throw new AppError("Category has already active!", 400, "CATEGORY_ALREADY_ACTIVE")
    }

    category.status = "ACTIVE"

    await category.save()

    return {
        categoryId: category._id,
        status: category.status
    }
}

export { handleGetAllCategories, handleGetCategoryById, handleCreateCategory, handleDeleteCategory, handleRestoreCategory, handleUpdateCategoryStatus }