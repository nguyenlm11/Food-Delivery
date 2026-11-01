export interface GetAllCategoriesParams {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
}

export interface CreateCategoryParams {
    name: string
    iconImage: string
}
