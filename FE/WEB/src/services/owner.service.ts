import type { GetOwnersQuery } from "@/types/owner.type"
import api from "./core/api"

export const getAllOwners = async (query: GetOwnersQuery) => {
    const response = await api.get("/owners", { params: query })
    return response.data
}

export const approveOwner = async (ownerId: string) => {
    const response = await api.post(`/owners/${ownerId}/approve`)
    return response.data
}

export const rejectOwner = async (ownerId: string, rejectionReason: string) => {
    const response = await api.post(`/owners/${ownerId}/reject`, { rejectionReason })
    return response.data
}
