import type { SortOrder } from "@/types/common.type"

export type MenuStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface Menu {
    _id: string
    restaurantId?: string
    name: string
    description: string
    status: MenuStatus
}

export interface GetMenusQuery {
    restaurantId?: string
    limit?: number
    page?: number
    search?: string
    status?: MenuStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface MenuFilterValues {
    status: "all" | MenuStatus
}

export interface CreateMenuBody {
    restaurantId: string
    menus: {
        name: string
        description?: string
    }[]
}

export interface UpdateMenuBody {
    name?: string
    description?: string
}
