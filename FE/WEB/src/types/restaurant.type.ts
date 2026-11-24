import type { SortOrder } from "@/types/common.type"

export type RestaurantStatus = "ACTIVE" | "INACTIVE" | "CLOSED" | "DELETED"

export type RestaurantApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface GetRestaurantsQuery {
    search?: string
    status?: RestaurantStatus
    categoryIds?: string | string[]
    approvalStatus?: RestaurantApprovalStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export interface RestaurantFilterValues {
    status: "all" | RestaurantStatus
    approvalStatus: "all" | RestaurantApprovalStatus
}

export interface CreateRestaurantBody {
    name: string
    description?: string
    logoImage?: string
    coverImage?: string
    phone: string
    address: string
    longitude: number
    latitude: number
    openTime?: string
    closeTime?: string
    categoryIds: string[]
}

export interface UpdateRestaurantBody {
    name?: string
    description?: string
    phone?: string
    address?: string
    longitude?: number
    latitude?: number
    openTime?: string
    closeTime?: string
}

export interface UpdateRestaurantImageBody {
    logoImage?: string
    coverImage?: string
}
