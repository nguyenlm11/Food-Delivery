export interface GetAllCategoriesParams {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface CreateCategoryParams {
    name: string
    iconImage: string
}
