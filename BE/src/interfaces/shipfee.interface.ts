interface ShipFeeCalculateQuery {
    customerLat?: number
    customerLng?: number
}

interface ShipFeeSearchQuery {
    search?: string
    ruleType?: "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    specialDate?: string
    isActive?: boolean | string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export { ShipFeeCalculateQuery, ShipFeeSearchQuery }