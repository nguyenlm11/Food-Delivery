import type { GetAllModifierGroupsParams } from "@/types/modifier.type"
import api from "./core/api"

export const getModifierGroupsByRestaurant = async (restaurantId: string, params: GetAllModifierGroupsParams) => {
    const response = await api.get(`/restaurants/${restaurantId}/modifier-groups`, { params })
    return response.data
}
