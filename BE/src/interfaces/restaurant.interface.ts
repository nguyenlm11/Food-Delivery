import { SortOrder } from "./common.interface"

type RestaurantStatus = "ACTIVE" | "INACTIVE" | "CLOSED" | "DELETED"

type RestaurantApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

interface CreateRestaurantBody {
    name: string
    description?: string
    logoImage?: string
    coverImage?: string
    phone?: string
    address?: string
    longitude?: number
    latitude?: number
    openTime?: string
    closeTime?: string
    categoryIds: string[]
}

interface UpdateRestaurantBody {
    name?: string
    description?: string
    phone?: string
    address?: string
    longitude?: number
    latitude?: number
    openTime?: string
    closeTime?: string
}

interface UpdateRestaurantImageBody {
    logoImage?: string
    coverImage?: string
}

interface GetRestaurantsQuery {
    search?: string
    status?: RestaurantStatus
    categoryIds?: string | string[]
    approvalStatus?: RestaurantApprovalStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

interface GetMyRestaurantsQuery {
    status?: RestaurantStatus
}

export { RestaurantStatus, RestaurantApprovalStatus, CreateRestaurantBody, UpdateRestaurantBody, UpdateRestaurantImageBody, GetRestaurantsQuery, GetMyRestaurantsQuery }
