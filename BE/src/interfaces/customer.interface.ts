interface CustomerUpdateParams {
    fullname?: string
    birthday?: string
    phone?: string
}

interface CustomerSearchQuery {
    search?: string
    status?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export { CustomerUpdateParams, CustomerSearchQuery }
