import type { GetAllCustomerParams } from "@/types/customer.type"
import api from "./api"

export const getAllCustomers = async (params: GetAllCustomerParams) => {
    const response = await api.get("/customers", { params })
    return response.data
}

export const deleteCustomer = async (customerId: string) => {
    const response = await api.delete(`/customers/${customerId}`)
    return response.data
}
