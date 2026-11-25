import type { CreateShipFeeBody, GetShipFeesQuery, UpdateShipFeeBody } from "@/types/shipfee.type"
import api from "./core/api"

export const createShipFee = async (body: CreateShipFeeBody) => {
    const response = await api.post("/ship-fees", body)
    return response.data
}

export const getAllShipFee = async (query: GetShipFeesQuery) => {
    const response = await api.get("/ship-fees", { params: query })
    return response.data
}

export const getShipFeeById = async (shipFeeId: string) => {
    const response = await api.get(`/ship-fees/${shipFeeId}`)
    return response.data
}

export const updateShipFee = async (shipFeeId: string, body: UpdateShipFeeBody) => {
    const response = await api.patch(`/ship-fees/${shipFeeId}`, body)
    return response.data
}

export const restoreShipFee = async (shipFeeId: string) => {
    const response = await api.post(`/ship-fees/${shipFeeId}/restore`)
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
