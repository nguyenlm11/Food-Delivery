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