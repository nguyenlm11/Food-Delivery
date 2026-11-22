import type { CreateMenuParams, GetAllMenusParams } from "@/types/menu.type"
import api from "./core/api"

export const createMenus = async (restaurantId: string, menus: CreateMenuParams[]) => {
    const response = await api.post(`/restaurants/${restaurantId}/menus`, { menus })
    return response.data
}

export const getMenusByRestaurant = async (restaurantId: string, params: GetAllMenusParams) => {
    const response = await api.get(`/restaurants/${restaurantId}/menus`, { params })
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
