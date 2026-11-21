interface MenuCreateParams {
    menus: {
        name: string
        description?: string
    }[]
}

interface MenuUpdateParams {
    name?: string
    description?: string
}

interface MenusByRestaurantQuery {
    search?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export { MenuCreateParams, MenuUpdateParams, MenusByRestaurantQuery }
