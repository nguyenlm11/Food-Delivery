interface ModifierGroupCreateParams {
    name: string
    minSelect: number
    maxSelect: number
    options: {
        name: string
        priceAdjustment: number
    }[]
}

interface ModifierGroupsByRestaurantQuery {
    search?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

interface FoodModifierGroupAttachParams {
    modifierGroupId: string
}

export { ModifierGroupCreateParams, FoodModifierGroupAttachParams, ModifierGroupsByRestaurantQuery }
