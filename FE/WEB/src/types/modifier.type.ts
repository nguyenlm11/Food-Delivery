export type ModifierStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export interface ModifierFilterValues {
    status: "all" | ModifierStatus
}

export interface GetAllModifierGroupsParams {
    search?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}
