import type { SortOrder } from "@/types/common.type"

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export interface GetCustomersQuery {
    limit?: number
    page?: number
    search?: string
    status?: CustomerStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface CustomerFilterValues {
    status: "all" | CustomerStatus
}
