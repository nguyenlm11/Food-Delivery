import { SortOrder } from "./common.interface"

type FoodStatus = "ACTIVE" | "INACTIVE" | "DELETED"

interface CreateFoodBody {
    restaurantId: string
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

interface GetFoodsQuery {
    restaurantId?: string
    menuId?: string
    status?: FoodStatus
    search?: string
}

export { FoodStatus, CreateFoodBody, UpdateFoodBody, GetFoodsQuery }
