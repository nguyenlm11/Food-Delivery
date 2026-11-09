export interface GetAllOwnerParams {
    search?: string
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED"
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}