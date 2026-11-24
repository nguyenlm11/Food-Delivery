import type { SortOrder } from "@/types/common.type"

export type ModifierStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface ModifierOption {
    _id: string
    modifierGroupId: string
    name: string
    priceAdjustment: number
    status: ModifierStatus
}

export interface ModifierGroup {
    _id: string
    restaurantId?: string
    name: string
    minSelect: number
    maxSelect: number
    status: ModifierStatus
    options?: ModifierOption[]
}

export interface ModifierFilterValues {
    status: "all" | ModifierStatus
}

export interface CreateModifierGroupBody {
    name: string
    minSelect: number
    maxSelect: number
    options: {
        name: string
        priceAdjustment: number
    }[]
}

export interface GetRestaurantModifierGroupsQuery {
    search?: string
    status?: ModifierStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}
