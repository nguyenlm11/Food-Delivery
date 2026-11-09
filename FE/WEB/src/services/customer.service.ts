import type { GetAllCustomerParams } from "@/types/customer.type"
import api from "./core/api"

export const getAllCustomers = async (params: GetAllCustomerParams) => {
    const response = await api.get("/customers", { params })
    return response.data
}
