import type { SortOrder } from "@/types/common.type"

export type CategoryStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface GetCategoriesQuery {
    limit?: number
    page?: number
    search?: string
    status?: CategoryStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface CategoryFilterValues {
    status: "all" | CategoryStatus
}

export interface CreateCategoryBody {
    name: string
    iconImage: string
}

export interface UpdateCategoryBody {
    name?: string
    iconImage?: string
}
