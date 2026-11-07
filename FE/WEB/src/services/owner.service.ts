import type { GetAllOwnerParams } from "@/types/owner.type"
import api from "./api"

export const getAllOwners = async (params: GetAllOwnerParams) => {
    const response = await api.get("/owners", { params })
    return response.data
}

export const approveOwner = async (ownerId: string) => {
    const response = await api.patch(`/owners/${ownerId}/approve`)
    return response.data
}

export const rejectOwner = async (ownerId: string, rejectionReason: string) => {
    const response = await api.patch(`/owners/${ownerId}/reject`, { rejectionReason })
    return response.data
}

export const deleteOwner = async (ownerId: string) => {
    const response = await api.delete(`/owners/${ownerId}`)
    return response.data
}
