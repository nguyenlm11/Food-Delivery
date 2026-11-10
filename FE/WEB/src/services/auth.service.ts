import type { LoginParams } from "@/types/auth.types"
import api from "./core/api"


export const login = async (params: LoginParams) => {
    const response = await api.post("/auth/staff-login", params)
    return response.data
}

export const refreshAccessToken = async () => {
    const response = await api.post("/auth/refresh-token")
    return response.data
}

export const logout = async () => {
    const response = await api.post("/auth/logout")
    return response.data
}

export const getMe = async () => {
    const response = await api.get("/auth/me")
    return response.data
}

export const deleteUser = async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`)
    return response.data
}

export const restoreUser = async (userId: string) => {
    const response = await api.patch(`/auth/users/${userId}/restore`)
    return response.data
}

export const updateUserStatus = async (userId: string, status: "ACTIVE" | "INACTIVE" | "BLOCKED") => {
    const response = await api.patch(`/auth/users/${userId}/status`, { status })
    return response.data
}
