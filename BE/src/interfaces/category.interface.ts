import { SortOrder } from "./common.interface"

type CategoryStatus = "ACTIVE" | "INACTIVE" | "DELETED"

interface CreateCategoryBody {
    name?: string
    iconImage?: string
}

interface GetCategoriesQuery {
    search?: string
    status?: CategoryStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export { CategoryStatus, CreateCategoryBody, GetCategoriesQuery }
