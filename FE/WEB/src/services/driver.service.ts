import type { GetDriversQuery } from "@/types/driver.type"
import api from "./core/api"

export const getAllDrivers = async (query: GetDriversQuery) => {
    const response = await api.get("/drivers", { params: query })
    return response.data
}

export const getDriverById = async (driverId: string) => {
    const response = await api.get(`/drivers/${driverId}`)
    return response.data
}