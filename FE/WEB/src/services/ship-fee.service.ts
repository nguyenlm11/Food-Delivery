import type { CreateShipFeeParams, GetAllShipFeeParams } from "@/types/shipfee.type"
import api from "./core/api"

export const createShipFee = async (body: CreateShipFeeParams) => {
    const response = await api.post("/ship-fees", body)
    return response.data
}

export const getAllShipFee = async (params: GetAllShipFeeParams) => {
    const response = await api.get("/ship-fees", { params })
    return response.data
}

export const updateShipFeeStatus = async (shipFeeId: string, status: "ACTIVE" | "INACTIVE") => {
    const response = await api.patch(`/ship-fees/${shipFeeId}/status`, { status })
    return response.data
}

export const deleteShipFee = async (shipFeeId: string) => {
    const response = await api.delete(`/ship-fees/${shipFeeId}`)
    return response.data
}

export const restoreShipFee = async (shipFeeId: string) => {
    const response = await api.patch(`/ship-fees/${shipFeeId}/restore`)
    return response.data
}
