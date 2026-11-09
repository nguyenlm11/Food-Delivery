export interface GetAllCustomerParams {
    search?: string
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}