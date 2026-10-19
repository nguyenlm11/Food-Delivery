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

interface CustomerSearchQuery {
    search?: string
    status?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

interface OwnerSearchQuery {
    search?: string
    approvalStatus?: string
    status?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

interface CategorySearchQuery {
    search?: string
    isActive?: boolean
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
    menuId: string
    modifierGroups?: ModifierGroupCreateParams[]
    modifierGroupIds?: string[]
}

interface ModifierGroupCreateParams {
    name: string
    minSelect: number
    maxSelect: number
    options: {
        name: string
        priceAdjustment: number
    }[]
}

interface FoodModifierGroupAttachParams {
    modifierGroupId: string
}

interface FoodUpdateParams {
    name?: string
    description?: string
    originalPrice?: number
    image?: string
    menuId?: string
}

interface CartCreateParams {
    items: {
        foodId: string
        quantity: number
        modifierOptionIds?: string[]
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

interface CreateNotificationParams {
    userId: string
    type: "ORDER" | "PAYMENT" | "RESTAURANT" | "DRIVER" | "SYSTEM"
    title: string
    message: string
    data?: any
}

export { CustomerUpdateParams, OwnerParams, OwnerUpdateParams, CitizenUpdateParams, CategoryParams, RestaurantParams, RestaurantSearchQuery, CategorySearchQuery, CustomerSearchQuery, OwnerSearchQuery, MenuCreateParams, MenuUpdateParams, FoodCreateParams, ModifierGroupCreateParams, FoodModifierGroupAttachParams, FoodUpdateParams, CartCreateParams, DriverParams, CreateNotificationParams }
