import type { SortOrder } from "@/types/common.type"

export type ModifierStatus = "ACTIVE" | "INACTIVE" | "DELETED"

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
