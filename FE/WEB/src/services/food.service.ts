import type { CreateFoodBody, GetFoodsQuery, UpdateFoodBody } from "@/types/food.type"
import api from "./core/api"

export const getFoods = async (query?: GetFoodsQuery) => {
    const response = await api.get("/foods", { params: query })
    return response.data
}

export const getFoodById = async (foodId: string) => {
    const response = await api.get(`/foods/${foodId}`)
    return response.data
}

export const createFood = async (body: CreateFoodBody) => {
    const response = await api.post("/foods", body)
    return response.data
}

export const updateFood = async (foodId: string, body: UpdateFoodBody) => {
    const response = await api.patch(`/foods/${foodId}`, body)
    return response.data
}

export const restoreFood = async (foodId: string) => {
    const response = await api.post(`/foods/${foodId}/restore`)
    return response.data
}

export const updateFoodStatus = async (foodId: string, status: "ACTIVE" | "INACTIVE") => {
    const response = await api.patch(`/foods/${foodId}/status`, { status })
    return response.data
}

export const deleteFood = async (foodId: string) => {
    const response = await api.delete(`/foods/${foodId}`)
    return response.data
}
