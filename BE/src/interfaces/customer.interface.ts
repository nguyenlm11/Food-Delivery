import { SortOrder } from "./common.interface"

type CustomerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED"

interface UpdateCustomerBody {
    fullname?: string
    birthday?: string
    phone?: string
}

interface GetCustomersQuery {
    search?: string
    status?: CustomerStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export { CustomerStatus, UpdateCustomerBody, GetCustomersQuery }
