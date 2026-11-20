import { ModifierGroupCreateParams } from "./modifier.interface"

interface FoodCreateParams {
    name: string
    description: string
    originalPrice: number
    image?: string
    menuId: string
    modifierGroups?: ModifierGroupCreateParams[]
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
    includeAll?: string
}

export { FoodCreateParams, FoodUpdateParams, FoodsByRestaurantQuery }
