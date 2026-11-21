import type { GetAllMenusParams } from "@/types/menu.type"
import api from "./core/api"

export const getMenusByRestaurant = async (restaurantId: string, params: GetAllMenusParams) => {
    const response = await api.get(`/restaurants/${restaurantId}/menus`, { params })
    return response.data
}
