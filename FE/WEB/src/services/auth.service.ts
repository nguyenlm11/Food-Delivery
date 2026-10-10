import api from "./api"
import type { LoginParams } from "../types/auth.types"


export const login = async (params: LoginParams) => {
    const response = await api.post("/auth/login", params)
    return response.data
}

export const refreshAccessToken = async () => {
    const response = await api.post("/auth/refresh-token")
    return response.data
}

export const getMe = async () => {
    const response = await api.get("/auth/me")
    return response.data
}