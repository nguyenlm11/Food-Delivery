import type { CreateCategoryBody, GetCategoriesQuery } from "@/types/category.type"
import api from "./core/api"

export const createCategory = async (body: CreateCategoryBody) => {
    const response = await api.post("/categories", body)
    return response.data
}

export const getAllCategories = async (query: GetCategoriesQuery) => {
    const response = await api.get("/categories", { params: query })
    return response.data
}

export const updateCategoryStatus = async (categoryId: string, status: "ACTIVE" | "INACTIVE") => {
    const response = await api.patch(`/categories/${categoryId}/status`, { status })
    return response.data
}

export const deleteCategory = async (categoryId: string) => {
    const response = await api.delete(`/categories/${categoryId}`)
    return response.data
}
