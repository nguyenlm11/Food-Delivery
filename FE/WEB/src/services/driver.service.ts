import type { CreateDriverBody, GetDriversQuery } from "@/types/driver.type"
import api from "./core/api"

export const createDriver = async (body: CreateDriverBody) => {
    const response = await api.post("/drivers", body)
    return response.data
}

export const getAllDrivers = async (query: GetDriversQuery) => {
    const response = await api.get("/drivers", { params: query })
    return response.data
}

export const getDriverById = async (driverId: string) => {
    const response = await api.get(`/drivers/${driverId}`)
    return response.data
}