import { SortOrder } from "./common.interface"

type ShipFeeStatus = "ACTIVE" | "INACTIVE" | "DELETED"

type ShipFeeRuleType = "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"

interface CalculateShipFeeQuery {
    restaurantId?: string
    customerLat?: number
    customerLng?: number
}

interface GetShipFeesQuery {
    search?: string
    ruleType?: ShipFeeRuleType
    specialDate?: string
    status?: ShipFeeStatus
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

interface CreateShipFeeBody {
    ruleType: "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
    name: string
    multiplier: number
    startTime?: string
    endTime?: string
    specialDate?: string
}

interface UpdateShipFeeBody {
    name?: string
    baseFee?: number
    perKmFee?: number
    multiplier?: number
    startTime?: string | null
    endTime?: string | null
    specialDate?: string | null
}

export { ShipFeeStatus, ShipFeeRuleType, CalculateShipFeeQuery, GetShipFeesQuery, CreateShipFeeBody, UpdateShipFeeBody }
