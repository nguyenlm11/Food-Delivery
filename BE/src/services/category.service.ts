import mongoose from "mongoose"
import Category from "../models/category.model"
import { AppError } from "../errors/error"
import { CategoryParams } from "../interfaces/interface"

const handleGetAllCategories = async () => {
    const categories = await Category
        .find()
        .sort({ name: 1 })
        .select("-__v")
        .lean()

    return categories
}

const handleGetCategoryById = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const category = await Category
        .findById(id)
        .select("-__v")
        .lean()

    if (!category) {
        throw new AppError("Category not found!", 404)
    }

    return category
}

const handleCreateCategory = async (params: CategoryParams) => {
    const { name, iconImage } = params

    if (!name || !iconImage) {
        throw new AppError("Missing required fields", 400)
    }

    const existName = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } })

    if (existName) {
        throw new AppError("Category name already exists", 400)
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
        isActive: true
    })

    return category
}

export { handleGetAllCategories, handleGetCategoryById, handleCreateCategory }