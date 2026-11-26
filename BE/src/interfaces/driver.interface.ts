import { SortOrder } from "./common.interface"

type DriverStatus = "OFFLINE" | "ONLINE" | "BUSY" | "SUSPENDED"

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
    driverStatus?: DriverStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export { DriverStatus, DriverAccountStatus, CreateDriverBody, GetDriversQuery }
