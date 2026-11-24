import { SortOrder } from "./common.interface"

type MenuStatus = "ACTIVE" | "INACTIVE" | "DELETED"

interface CreateMenuBody {
    menus: {
        name: string
        description?: string
    }[]
}

interface UpdateMenuBody {
    name?: string
    description?: string
}

interface GetRestaurantMenusQuery {
    search?: string
    status?: MenuStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export { MenuStatus, CreateMenuBody, UpdateMenuBody, GetRestaurantMenusQuery }
