export type ShipFeeStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export type ShipFeeRuleType = "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"

export interface GetAllShipFeeParams {
    page: number
    limit: number
    search: string
    ruleType: ShipFeeRuleType | undefined
    specialDate: string | undefined
    status: ShipFeeStatus | undefined
    sortBy: string
    sortOrder: "asc" | "desc"
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
