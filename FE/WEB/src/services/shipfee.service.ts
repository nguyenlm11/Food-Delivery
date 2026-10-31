import type { getAllShipFeeParams } from "@/types/shipfee.type"
import api from "./api"

export const getAllShipFee = async (params: getAllShipFeeParams) => {
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
