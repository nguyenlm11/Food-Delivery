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
    phone?: string
    address?: string
    longitude?: number
    latitude?: number
    openTime?: string
    closeTime?: string
    categoryIds: string[]
}

interface RestaurantSearchQuery {
    search?: string
    status?: string
    categoryIds?: string | string[]
    approvalStatus?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

interface MenuCreateParams {
    menus: {
        name: string
        description?: string
    }[]
}

interface MenuUpdateParams {
    name?: string
    description?: string
}

interface FoodCreateParams {
    name: string
    description: string
    originalPrice: number
    image?: string
    menuIds: string[]
}

interface FoodUpdateParams {
    name?: string
    description?: string
    originalPrice?: number
    image?: string
}

interface CartCreateParams {
    items: {
        foodId: string
        quantity: number
    }[]
}

interface DriverParams {
    fullname: string
    email: string
    birthday: string
    address: string
    phone: string
    citizenId: string
    citizenImages?: {
        front?: string
        back?: string
    }
    driverLicenseId: string
    vehicleModel: string
    vehicleRegistrationId: string
    licensePlate: string
    bankAccount: {
        bankName: string
        accountNumber: string
        accountHolder: string
    }
}

export { CustomerUpdateParams, OwnerParams, OwnerUpdateParams, CitizenUpdateParams, CategoryParams, RestaurantParams, RestaurantSearchQuery, MenuCreateParams, MenuUpdateParams, FoodCreateParams, FoodUpdateParams, CartCreateParams, DriverParams }