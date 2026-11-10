export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export interface GetAllCustomerParams {
    page: number
    limit: number
    search: string
    status: CustomerStatus | undefined
    sortBy: string
    sortOrder: "asc" | "desc"
}

export interface CustomerFilterValues {
    status: "all" | CustomerStatus
}
