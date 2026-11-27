import { SortOrder } from "./common.interface"

type DriverPresenceStatus = "ONLINE" | "OFFLINE"

type DriverWorkStatus = "IDLE" | "BUSY" | "OFF_DUTY"

type DriverAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

interface CreateDriverBody {
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

interface GetDriversQuery {
    search?: string
    status?: DriverAccountStatus
    presenceStatus?: DriverPresenceStatus
    workStatus?: DriverWorkStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export { DriverPresenceStatus, DriverWorkStatus, DriverAccountStatus, CreateDriverBody, GetDriversQuery }
