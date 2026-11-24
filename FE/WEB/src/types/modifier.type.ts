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
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}
