import type { GetAllCategoriesParams } from "../types/category.types"
import api from "./api"

export const getAllCategories = async (params: GetAllCategoriesParams = {}) => {
    const { page = 1, limit = 10, search, isActive } = params

    const response = await api.get("/categories", {
        params: { page, limit, search: search?.trim(), isActive },
    })

    return response.data
}
