export interface GetAllShipFeeParams {
    search?: string
    ruleType?: "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    specialDate?: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface ShipFeeParams {
    search?: string
    ruleType?: "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
}

export interface CreateShipFeeParams {
    ruleType: "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    name: string
    multiplier: number
    startTime?: string
    endTime?: string
    specialDate?: string
}
