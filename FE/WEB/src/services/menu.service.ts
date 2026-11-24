import type { CreateMenuBody, GetRestaurantMenusQuery } from "@/types/menu.type"
import api from "./core/api"

export const createMenus = async (restaurantId: string, body: CreateMenuBody) => {
    const response = await api.post(`/restaurants/${restaurantId}/menus`, body)
    return response.data
}

export const getMenusByRestaurant = async (restaurantId: string, query: GetRestaurantMenusQuery) => {
    const response = await api.get(`/restaurants/${restaurantId}/menus`, { params: query })
    return response.data
}

export const updateMenuStatus = async (menuId: string, status: string) => {
    const response = await api.patch(`/menus/${menuId}/status`, { status })
    return response.data
}

export const deleteMenu = async (menuId: string) => {
    const response = await api.delete(`/menus/${menuId}`)
    return response.data
}
