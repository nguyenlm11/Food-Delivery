interface UserQueryParams {
    email?: string
    name?: string
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export { UserQueryParams }
