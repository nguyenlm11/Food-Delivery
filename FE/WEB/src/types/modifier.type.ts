export type ModifierStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface ModifierOption {
    _id: string
    modifierGroupId: string
    name: string
    priceAdjustment: number
    status: ModifierStatus
}

export interface ModifierGroup {
    _id: string
    name: string
    minSelect: number
    maxSelect: number
    status: ModifierStatus
    options: ModifierOption[]
}

export interface ModifierFilterValues {
    status: "all" | ModifierStatus
}
