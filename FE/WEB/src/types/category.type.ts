export interface GetAllCategoriesParams {
    page: number
    limit: number
    search: string
    isActive: boolean | undefined
    sortBy: string
    sortOrder: "asc" | "desc"
}

export interface CategoryFilterValues {
    isActive: "all" | "active" | "inactive"
}

export interface CreateCategoryParams {
    name: string
    iconImage: string
}
