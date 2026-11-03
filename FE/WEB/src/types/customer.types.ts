export interface GetAllCustomerParams {
    search?: string
    status?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}