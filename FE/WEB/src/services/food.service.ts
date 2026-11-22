import api from "./core/api"

export const getFoodsByRestaurant = async (restaurantId: string, params?: { status?: string }) => {
    const response = await api.get(`/restaurants/${restaurantId}/foods`, { params })
    return response.data.data
}
