import type { GetAllRestaurantParams } from "@/types/restaurants"
import api from "./core/api"

export const getAllRestaurants = async (params: GetAllRestaurantParams) => {
    const response = await api.get("/restaurants", { params })
    return response.data
}

export const getMyRestaurants = async () => {
    const response = await api.get("/restaurants/me")
    return response.data
}

