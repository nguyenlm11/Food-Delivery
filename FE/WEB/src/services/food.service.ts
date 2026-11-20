import api from "./core/api"

export const getFoodsByRestaurant = async (restaurantId: string, includeAll = false) => {
    const response = await api.get(`/restaurants/${restaurantId}/foods`, {
        params: includeAll ? { includeAll: "true" } : undefined
    })
    return response.data.data
}
