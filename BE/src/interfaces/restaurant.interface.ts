interface RestaurantParams {
    name: string
    description?: string
    logoImage?: string
    coverImage?: string
    phone?: string
    address?: string
    longitude?: number
    latitude?: number
    openTime?: string
    closeTime?: string
    categoryIds: string[]
}

interface RestaurantSearchQuery {
    search?: string
    status?: string
    categoryIds?: string | string[]
    approvalStatus?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export { RestaurantParams, RestaurantSearchQuery }
