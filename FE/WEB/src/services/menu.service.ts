import type { CreateMenuBody, GetMenusQuery, UpdateMenuBody } from "@/types/menu.type"
import api from "./core/api"

export const getMenus = async (query?: GetMenusQuery) => {
    const response = await api.get("/menus", { params: query })
    return response.data
}

export const getMenuById = async (menuId: string) => {
    const response = await api.get(`/menus/${menuId}`)
    return response.data
}

export const createMenus = async (body: CreateMenuBody) => {
    const response = await api.post("/menus", body)
    return response.data
}

export const updateMenu = async (menuId: string, body: UpdateMenuBody) => {
    const response = await api.patch(`/menus/${menuId}`, body)
    return response.data
}

export const restoreMenu = async (menuId: string) => {
    const response = await api.post(`/menus/${menuId}/restore`)
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
