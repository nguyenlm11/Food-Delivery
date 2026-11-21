import api from "./core/api"

export const getFoodsByRestaurant = async (restaurantId: string, includeAll: boolean) => {
    const response = await api.get(`/restaurants/${restaurantId}/foods`, { params: includeAll })
    return response.data.data
}
