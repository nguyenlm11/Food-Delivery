import { SortOrder } from "./common.interface"
import { CreateAddressBody } from "./address.interface"

type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

interface GetUsersQuery {
    email?: string
    name?: string
    status?: UserStatus
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: SortOrder
}

interface CreateCustomerBody {
    fullname: string
    email: string
    birthday: string
    phone: string
    password: string
    address: CreateAddressBody
}

export { UserStatus, GetUsersQuery, CreateCustomerBody }
