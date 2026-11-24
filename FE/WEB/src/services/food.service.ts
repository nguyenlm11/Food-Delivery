import type { CreateFoodBody, GetRestaurantFoodsQuery } from "@/types/food.type"
import api from "./core/api"

export const getFoodsByRestaurant = async (restaurantId: string, query?: GetRestaurantFoodsQuery) => {
    const response = await api.get(`/restaurants/${restaurantId}/foods`, { params: query })
    return response.data
}

export const createFood = async (restaurantId: string, body: CreateFoodBody) => {
    const response = await api.post(`/restaurants/${restaurantId}/foods`, body)
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
