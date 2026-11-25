import type { CreateRestaurantBody, GetRestaurantsQuery, RestaurantStatus, UpdateRestaurantImageBody, UpdateRestaurantBody } from "@/types/restaurant.type"
import api from "./core/api"

export const createRestaurant = async (body: CreateRestaurantBody) => {
    const response = await api.post("/restaurants", body)
    return response.data
}

export const getAllRestaurants = async (query: GetRestaurantsQuery) => {
    const response = await api.get("/restaurants", { params: query })
    return response.data
}

export const getMyRestaurants = async () => {
    const response = await api.get("/restaurants/me")
    return response.data
}

export const approveRestaurant = async (restaurantId: string) => {
    const response = await api.post(`/restaurants/${restaurantId}/approve`)
    return response.data
}

export const rejectRestaurant = async (restaurantId: string, rejectionReason: string) => {
    const response = await api.post(`/restaurants/${restaurantId}/reject`, { rejectionReason })
    return response.data
}

export const deleteRestaurant = async (restaurantId: string) => {
    const response = await api.delete(`/restaurants/${restaurantId}`)
    return response.data
}

export const getRestaurantById = async (restaurantId: string) => {
    const response = await api.get(`/restaurants/${restaurantId}`)
    return response.data
}

export const updateRestaurant = async (restaurantId: string, body: UpdateRestaurantBody) => {
    const response = await api.patch(`/restaurants/${restaurantId}`, body)
    return response.data
}

export const updateRestaurantImage = async (restaurantId: string, body: UpdateRestaurantImageBody) => {
    const response = await api.patch(`/restaurants/${restaurantId}/image`, body)
    return response.data
}

export const updateRestaurantStatus = async (restaurantId: string, status: RestaurantStatus) => {
    const response = await api.patch(`/restaurants/${restaurantId}/status`, { status })
    return response.data
}

export const restoreRestaurant = async (restaurantId: string) => {
    const response = await api.post(`/restaurants/${restaurantId}/restore`)
    return response.data
}
