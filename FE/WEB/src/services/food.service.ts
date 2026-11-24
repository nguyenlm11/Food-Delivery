import type { GetRestaurantFoodsQuery } from "@/types/food.type"
import api from "./core/api"

export const getFoodsByRestaurant = async (restaurantId: string, query?: GetRestaurantFoodsQuery) => {
    const response = await api.get(`/restaurants/${restaurantId}/foods`, { params: query })
    return response.data.data
}
