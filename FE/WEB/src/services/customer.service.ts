import type { GetCustomersQuery } from "@/types/customer.type"
import api from "./core/api"

export const getAllCustomers = async (query: GetCustomersQuery) => {
    const response = await api.get("/customers", { params: query })
    return response.data
}
