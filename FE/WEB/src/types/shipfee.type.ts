export type ShipFeeStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export type ShipFeeRuleType = "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"

export interface GetAllShipFeeParams {
    limit?: number
    page?: number
    search?: string
    ruleType?: ShipFeeRuleType
    specialDate?: string
    status?: ShipFeeStatus
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface ShipFeeFilterValues {
    status: "all" | ShipFeeStatus
    ruleType: "all" | ShipFeeRuleType
}

export interface CreateShipFeeParams {
    ruleType: "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    name: string
    multiplier: number
    startTime?: string
    endTime?: string
    specialDate?: string
}
