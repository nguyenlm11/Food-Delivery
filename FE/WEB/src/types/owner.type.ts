export type OwnerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export type OwnerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface GetAllOwnerParams {
    limit?: number
    page?: number
    search?: string
    approvalStatus?: OwnerApprovalStatus
    status?: OwnerStatus
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface OwnerFilterValues {
    status: "all" | OwnerStatus
    approvalStatus: "all" | OwnerApprovalStatus
}
