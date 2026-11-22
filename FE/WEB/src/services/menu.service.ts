import type { CreateMenuParams, GetAllMenusParams } from "@/types/menu.type"
import api from "./core/api"

export const getMenusByRestaurant = async (restaurantId: string, params: GetAllMenusParams) => {
    const response = await api.get(`/restaurants/${restaurantId}/menus`, { params })
    return response.data
}

export const createMenus = async (restaurantId: string, menus: CreateMenuParams[]) => {
    const response = await api.post(`/restaurants/${restaurantId}/menus`, { menus })
    return response.data
}
