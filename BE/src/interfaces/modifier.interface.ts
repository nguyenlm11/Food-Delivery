import { SortOrder } from "./common.interface"

type ModifierStatus = "ACTIVE" | "INACTIVE" | "DELETED"

interface CreateModifierGroupBody {
    restaurantId: string
    name: string
    minSelect: number
    maxSelect: number
    options: {
        name: string
        priceAdjustment: number
    }[]
}

interface UpdateModifierGroupBody {
    name?: string
    minSelect?: number
    maxSelect?: number
}

interface GetModifierGroupsQuery {
    restaurantId?: string
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

interface CreateModifierOptionBody {
    modifierGroupId: string
    name: string
    priceAdjustment: number
}

interface UpdateModifierOptionBody {
    name?: string
    priceAdjustment?: number
}

export { ModifierStatus, CreateModifierGroupBody, UpdateModifierGroupBody, GetModifierGroupsQuery, AttachModifierGroupToFoodBody, CreateModifierOptionBody, UpdateModifierOptionBody }
