import type { SortOrder } from "@/types/common.type"

export type ShipFeeStatus = "ACTIVE" | "INACTIVE" | "DELETED"

export type ShipFeeRuleType = "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"

export interface GetShipFeesQuery {
    limit?: number
    page?: number
    search?: string
    ruleType?: ShipFeeRuleType
    specialDate?: string
    status?: ShipFeeStatus
    sortBy?: string
    sortOrder?: SortOrder
}

export interface ShipFeeFilterValues {
    status: "all" | ShipFeeStatus
    ruleType: "all" | ShipFeeRuleType
}

export interface CreateShipFeeBody {
    ruleType: "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    name: string
    multiplier: number
    startTime?: string
    endTime?: string
    specialDate?: string
}

export interface UpdateShipFeeBody {
    name?: string
    baseFee?: number
    perKmFee?: number
    multiplier?: number
    startTime?: string | null
    endTime?: string | null
    specialDate?: string | null
}
