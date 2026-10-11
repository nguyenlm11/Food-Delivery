import api from "./api"
import type { Category } from "../types/category.types"

export const getAllCategories = async () => {
    const response = await api.get<{ data: Category[] }>("/categories")
    return response.data.data
}
