interface UserQueryParams {
    email?: string
    name?: string
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc";
}

interface CustomerUpdateParams {
    fullname?: string
    birthday?: string
    address?: string
    phone?: string
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

interface CitizenUpdateParams {
    citizenId: string
    citizenImages: {
        front: string
        back: string
    }
}

interface CategoryParams {
    name?: string
    iconImage?: string
}

interface RestaurantParams {
    name: string
    description?: string
    logoImage?: string
    coverImage?: string
    phone: string
    address: string
    location: [number, number]
    openTime?: string
    closeTime?: string
    categoryIds: string[]
}

export { CustomerUpdateParams, OwnerParams, OwnerUpdateParams, CitizenUpdateParams, CategoryParams, RestaurantParams }