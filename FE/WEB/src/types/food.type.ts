import type { MenuStatus } from "@/types/menu.type"
import type { SortOrder } from "@/types/common.type"

export type FoodStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface Food {
    _id: string
    restaurantId?: string
    menuId?: string
    name: string
    description: string
    originalPrice: number
    platformPrice: number
    image: string
    status: FoodStatus
}

export interface MenuFoodGroup {
    _id: string
    name: string
    description: string
    status: MenuStatus
    foods: Food[]
}

export interface FoodFilterValues {
    status: "all" | FoodStatus
    menuId: "all" | string
}

export interface GetFoodsQuery {
    restaurantId?: string
    status?: FoodStatus
    menuId?: string
    search?: string
    limit?: number
    page?: number
    sortBy?: string
    sortOrder?: SortOrder
}

export interface CreateFoodBody {
    restaurantId: string
    name: string
    description: string
    originalPrice: number
    image?: string
    menuId: string
    modifierGroupIds?: string[]
}

export interface UpdateFoodBody {
    name?: string
    description?: string
    originalPrice?: number
    image?: string
    menuId?: string
}
