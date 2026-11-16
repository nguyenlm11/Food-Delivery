export interface GetAllRestaurantParams {
    search?: string
    status?: string
    categoryIds?: string | string[]
    approvalStatus?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}