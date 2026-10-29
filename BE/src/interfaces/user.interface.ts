import { AddressCreateParams } from "./address.interface"

interface UserQueryParams {
    email?: string
    name?: string
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

interface CustomerRegisterParams {
    fullname: string
    email: string
    birthday: string
    phone: string
    password: string
    address: AddressCreateParams
}

export { UserQueryParams, CustomerRegisterParams }
