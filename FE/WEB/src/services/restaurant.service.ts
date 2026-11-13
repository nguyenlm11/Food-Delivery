import api from "./core/api"

export const getMyRestaurants = async () => {
    const response = await api.get("/restaurants/me")
    return response.data
}
