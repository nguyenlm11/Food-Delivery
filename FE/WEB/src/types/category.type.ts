export interface GetAllCategoriesParams {
    limit?: number
    page?: number
    search?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface CategoryFilterValues {
    status: "all" | "ACTIVE" | "INACTIVE" | "DELETED"
}

export interface CreateCategoryParams {
    name: string
    iconImage: string
}
