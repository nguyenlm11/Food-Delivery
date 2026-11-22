import type { ModifierGroup } from "@/types/modifier.type"
import api from "./core/api"

export const getModifierGroupsByRestaurant = async (restaurantId: string) => {
    const response = await api.get(`/restaurants/${restaurantId}/modifier-groups`)
    return response.data.data as ModifierGroup[]
}
