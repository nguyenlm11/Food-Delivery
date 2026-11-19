export type RestaurantStatus = "ACTIVE" | "INACTIVE" | "CLOSED" | "DELETED"

export type RestaurantApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface GetAllRestaurantParams {
    search?: string
    status?: RestaurantStatus
    categoryIds?: string | string[]
    approvalStatus?: RestaurantApprovalStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface RestaurantFilterValues {
    status: "all" | RestaurantStatus
    approvalStatus: "all" | RestaurantApprovalStatus
}

export interface CreateRestaurantParams {
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