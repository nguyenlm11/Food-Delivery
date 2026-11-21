export type MenuStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface Menu {
    _id: string
    restaurantId?: string
    name: string
    description: string
    status: MenuStatus
}

export interface GetAllMenusParams {
    limit?: number
    page?: number
    search?: string
    status?: MenuStatus
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface MenuFilterValues {
    status: "all" | MenuStatus
}

export interface CreateMenuParams {
    name: string
    description?: string
}
