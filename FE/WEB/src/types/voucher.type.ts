export type VoucherTypeVoucher = "SYSTEM" | "RESTAURANT"

export type VoucherType = "FOOD" | "SHIP"

export type VoucherTypeDiscount = "AMOUNT" | "PERCENT"

export type VoucherStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED"

export interface GetAllVoucherParams {
    limit?: number
    page?: number
    search?: string
    typeVoucher?: VoucherTypeVoucher
    type?: VoucherType
    typeDiscount?: VoucherTypeDiscount
    status?: VoucherStatus
    restaurantId?: string
    date?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface VoucherFilterValues {
    typeVoucher: "all" | VoucherTypeVoucher
    type: "all" | VoucherType
    typeDiscount: "all" | VoucherTypeDiscount
    status: "all" | VoucherStatus
}
