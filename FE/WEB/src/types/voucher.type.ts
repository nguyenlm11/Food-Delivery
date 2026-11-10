export type VoucherTypeVoucher = "SYSTEM" | "RESTAURANT"

export type VoucherType = "FOOD" | "SHIP"

export type VoucherTypeDiscount = "AMOUNT" | "PERCENT"

export type VoucherStatus = "ACTIVE" | "INACTIVE" | "EXPIRED"

export interface GetAllVoucherParams {
    page: number
    limit: number
    search: string
    typeVoucher: VoucherTypeVoucher | undefined
    type: VoucherType | undefined
    typeDiscount: VoucherTypeDiscount | undefined
    status: VoucherStatus | undefined
    restaurantId: string | undefined
    date: string | undefined
    sortBy: string
    sortOrder: "asc" | "desc"
}

export interface VoucherFilterValues {
    typeVoucher: "all" | VoucherTypeVoucher
    type: "all" | VoucherType
    typeDiscount: "all" | VoucherTypeDiscount
    status: "all" | VoucherStatus
}
