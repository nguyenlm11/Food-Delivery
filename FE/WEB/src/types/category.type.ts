export interface GetAllCategoriesParams {
    page: number
    limit: number
    search: string
    status: "ACTIVE" | "INACTIVE" | "DELETED" | undefined
    sortBy: string
    sortOrder: "asc" | "desc"
}

export interface CategoryFilterValues {
    status: "all" | "ACTIVE" | "INACTIVE" | "DELETED"
}

export interface CreateCategoryParams {
    name: string
    iconImage: string
}
