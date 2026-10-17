import type { GetAllCategoriesParams } from "../types/category.types"
import api from "./api"

export const getAllCategories = async (params: GetAllCategoriesParams = {}) => {
    const { page = 1, limit = 10, search, isActive } = params
    const response = await api.get("/categories", {
        params: { page, limit, search: search?.trim(), isActive },
    })
    return response.data
}

export const restoreCategory = async (categoryId: string) => {
    const response = await api.patch(`/categories/${categoryId}/restore`)
    return response.data
}

export const deleteCategory = async (categoryId: string) => {
    const response = await api.delete(`/categories/${categoryId}`)
    return response.data
}