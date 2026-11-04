import type { GetAllOwnerParams } from "@/types/owner.type"
import api from "./api"

export const getAllOwners = async (params: GetAllOwnerParams) => {
    const response = await api.get("/owners", { params })
    return response.data
}