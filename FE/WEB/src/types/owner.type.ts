import type { SortOrder } from "@/types/common.type"

export type OwnerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export type OwnerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface GetOwnersQuery {
    limit?: number
    page?: number
    search?: string
    approvalStatus?: OwnerApprovalStatus
    status?: OwnerStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface OwnerFilterValues {
    status: "all" | OwnerStatus
    approvalStatus: "all" | OwnerApprovalStatus
}
