interface ShipFeeCalculateQuery {
    customerLat?: number
    customerLng?: number
}

interface ShipFeeSearchQuery {
    search?: string
    ruleType?: "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    specialDate?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

interface CreateShipFeeParams {
    ruleType: "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    name: string
    multiplier: number
    startTime?: string
    endTime?: string
    specialDate?: string
}

interface UpdateShipFeeParams {
    name?: string
    multiplier?: number
    startTime?: string | null
    endTime?: string | null
    specialDate?: string | null
}

export { ShipFeeCalculateQuery, ShipFeeSearchQuery, CreateShipFeeParams, UpdateShipFeeParams }