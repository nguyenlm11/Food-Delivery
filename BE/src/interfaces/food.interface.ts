import { SortOrder } from "./common.interface"

type FoodStatus = "ACTIVE" | "INACTIVE" | "DELETED"

interface CreateFoodBody {
    name: string
    description: string
    originalPrice: number
    image?: string
    menuId: string
    modifierGroupIds?: string[]
}

interface UpdateFoodBody {
    name?: string
    description?: string
    originalPrice?: number
    image?: string
    menuId?: string
}

interface GetRestaurantFoodsQuery {
    status?: FoodStatus
}

export { FoodStatus, CreateFoodBody, UpdateFoodBody, GetRestaurantFoodsQuery }
