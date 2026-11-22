import { ModifierGroupCreateParams } from "./modifier.interface"

interface FoodCreateParams {
    name: string
    description: string
    originalPrice: number
    image?: string
    menuId: string
    modifierGroupIds?: string[]
}

interface FoodUpdateParams {
    name?: string
    description?: string
    originalPrice?: number
    image?: string
    menuId?: string
}

interface FoodsByRestaurantQuery {
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
}

export { FoodCreateParams, FoodUpdateParams, FoodsByRestaurantQuery }
