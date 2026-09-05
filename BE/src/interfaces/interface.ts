interface UserQueryParams {
    email?: string
    role?: string
    name?: string
    stationId?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc";
}

export { UserQueryParams }