interface UserQueryParams {
    email?: string
    role?: string
    name?: string
    stationId?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc";
}

interface OwnerParams {
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

interface OwnerUpdateParams {
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

export { OwnerParams, OwnerUpdateParams }