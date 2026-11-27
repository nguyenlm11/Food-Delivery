import type { SortOrder } from "@/types/common.type"

export type DriverPresenceStatus = "ONLINE" | "OFFLINE"

export type DriverWorkStatus = "IDLE" | "BUSY" | "OFF_DUTY"

export type DriverAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

export interface GetDriversQuery {
    limit?: number
    page?: number
    search?: string
    presenceStatus?: DriverPresenceStatus
    workStatus?: DriverWorkStatus
    status?: DriverAccountStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface DriverFilterValues {
    status: "all" | DriverAccountStatus
    presenceStatus: "all" | DriverPresenceStatus
    workStatus: "all" | DriverWorkStatus
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