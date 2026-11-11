export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export interface GetAllCustomerParams {
    limit?: number
    page?: number
    search?: string
    status?: CustomerStatus
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface CustomerFilterValues {
    status: "all" | CustomerStatus
}
