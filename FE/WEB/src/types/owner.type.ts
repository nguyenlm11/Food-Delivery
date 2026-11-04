export interface GetAllOwnerParams {
    search?: string
    approvalStatus?: string
    status?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}