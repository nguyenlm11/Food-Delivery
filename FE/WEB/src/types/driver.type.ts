import type { SortOrder } from "@/types/common.type"

export type DriverStatus = "OFFLINE" | "ONLINE" | "BUSY" | "SUSPENDED"

export type DriverAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export interface GetDriversQuery {
    limit?: number
    page?: number
    search?: string
    driverStatus?: DriverStatus
    status?: DriverAccountStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface DriverFilterValues {
    status: "all" | DriverAccountStatus
    driverStatus: "all" | DriverStatus
}

export interface CreateDriverBody {
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