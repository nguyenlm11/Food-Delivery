import type { CreateModifierGroupBody, GetModifierGroupsQuery, UpdateModifierGroupBody } from "@/types/modifier.type"
import api from "./core/api"

export const getModifierGroups = async (query?: GetModifierGroupsQuery) => {
    const response = await api.get("/modifier-groups", { params: query })
    return response.data
}

export const getModifierGroupById = async (modifierGroupId: string) => {
    const response = await api.get(`/modifier-groups/${modifierGroupId}`)
    return response.data
}

export const getModifierGroupOptions = async (modifierGroupId: string) => {
    const response = await api.get(`/modifier-groups/${modifierGroupId}/options`)
    return response.data
}

export const createModifierGroup = async (body: CreateModifierGroupBody) => {
    const response = await api.post("/modifier-groups", body)
    return response.data
}

export const updateModifierGroup = async (modifierGroupId: string, body: UpdateModifierGroupBody) => {
    const response = await api.patch(`/modifier-groups/${modifierGroupId}`, body)
    return response.data
}

export const restoreModifierGroup = async (modifierGroupId: string) => {
    const response = await api.post(`/modifier-groups/${modifierGroupId}/restore`)
    return response.data
}

export const updateModifierGroupStatus = async (modifierGroupId: string, status: string) => {
    const response = await api.patch(`/modifier-groups/${modifierGroupId}/status`, { status })
    return response.data
}

export const deleteModifierGroup = async (modifierGroupId: string) => {
    const response = await api.delete(`/modifier-groups/${modifierGroupId}`)
    return response.data
}
