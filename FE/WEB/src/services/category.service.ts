import api from "./api"

export const getAllCategories = async (page = 1, limit = 10) => {
    const response = await api.get("/categories", { params: { page, limit } })
    return response.data
}
