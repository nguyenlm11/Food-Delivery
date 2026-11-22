import type { MenuStatus } from "@/types/menu.type"

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
