export type OwnerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export type OwnerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface GetAllOwnerParams {
    page: number
    limit: number
    search: string
    approvalStatus: OwnerApprovalStatus | undefined
    status: OwnerStatus | undefined
    sortBy: string
    sortOrder: "asc" | "desc"
}

export interface OwnerFilterValues {
    status: "all" | OwnerStatus
    approvalStatus: "all" | OwnerApprovalStatus
}
