import type { GetAllVoucherParams } from "@/types/voucher.type"
import api from "./api"

export const getAllVouchers = async (params: GetAllVoucherParams) => {
    const response = await api.get("/vouchers", { params })
    console.log(response.data)
    return response.data
}