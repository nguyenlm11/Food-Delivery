interface ModifierGroupCreateParams {
    name: string
    minSelect: number
    maxSelect: number
    options: {
        name: string
        priceAdjustment: number
    }[]
}

interface FoodModifierGroupAttachParams {
    modifierGroupId: string
}

export { ModifierGroupCreateParams, FoodModifierGroupAttachParams }
