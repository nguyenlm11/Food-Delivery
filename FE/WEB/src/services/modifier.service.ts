import type { CreateModifierGroupBody, GetRestaurantModifierGroupsQuery } from "@/types/modifier.type"
import api from "./core/api"

export const createModifierGroup = async (restaurantId: string, body: CreateModifierGroupBody) => {
    const response = await api.post(`/restaurants/${restaurantId}/modifier-groups`, { body })
    return response.data
}

export const getRestaurantModifierGroups = async (restaurantId: string, query: GetRestaurantModifierGroupsQuery) => {
    const response = await api.get(`/restaurants/${restaurantId}/modifier-groups`, { params: query })
    return response.data
}
