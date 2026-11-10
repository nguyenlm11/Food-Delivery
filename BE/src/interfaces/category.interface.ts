interface CategoryParams {
    name?: string
    iconImage?: string
}

interface CategorySearchQuery {
    search?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export { CategoryParams, CategorySearchQuery }
