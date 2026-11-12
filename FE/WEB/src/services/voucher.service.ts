import type { CreateVoucherParams, GetAllVoucherParams } from "@/types/voucher.type"
import api from "./core/api"

export const createVoucher = async (body: CreateVoucherParams) => {
    const response = await api.post("/vouchers", body)
    return response.data
}

export const getAllVouchers = async (params: GetAllVoucherParams) => {
    const response = await api.get("/vouchers", { params })
    return response.data
}

export const updateVoucherStatus = async (voucherId: string, status: "ACTIVE" | "INACTIVE") => {
    const response = await api.patch(`/vouchers/${voucherId}/status`, { status })
    return response.data
}

export const restoreVoucher = async (voucherId: string) => {
    const response = await api.patch(`/vouchers/${voucherId}/restore`)
    return response.data
}

export const deleteVoucher = async (voucherId: string) => {
    const response = await api.delete(`/vouchers/${voucherId}`)
    return response.data
}
