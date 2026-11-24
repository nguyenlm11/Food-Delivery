import { SortOrder } from "./common.interface"

type ModifierStatus = "ACTIVE" | "INACTIVE" | "DELETED"

interface CreateModifierGroupBody {
    name: string
    minSelect: number
    maxSelect: number
    options: {
        name: string
        priceAdjustment: number
    }[]
}

interface GetRestaurantModifierGroupsQuery {
    search?: string
    status?: ModifierStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

interface AttachModifierGroupToFoodBody {
    modifierGroupId: string
}

export { ModifierStatus, CreateModifierGroupBody, AttachModifierGroupToFoodBody, GetRestaurantModifierGroupsQuery }
