import { SortOrder } from "./common.interface"

type OwnerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

type OwnerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

interface CreateOwnerBody {
    fullname?: string
    email?: string
    birthday?: string
    address?: string
    phone?: string
    password?: string
    citizenId?: string
    citizenImages?: {
        front: string
        back: string
    }
    taxCode?: string
    bankAccount?: {
        bankName?: string
        accountNumber?: string
        accountHolder?: string
    }
}

interface UpdateOwnerBody {
    fullname?: string
    birthday?: string
    address?: string
    phone?: string
    taxCode?: string
    bankAccount?: {
        bankName?: string
        accountNumber?: string
        accountHolder?: string
    }
}

interface GetOwnersQuery {
    search?: string
    approvalStatus?: OwnerApprovalStatus
    status?: OwnerStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

interface UpdateCitizenBody {
    citizenId: string
    citizenImages: {
        front: string
        back: string
    }
}

export { OwnerStatus, OwnerApprovalStatus, CreateOwnerBody, UpdateOwnerBody, GetOwnersQuery, UpdateCitizenBody }
