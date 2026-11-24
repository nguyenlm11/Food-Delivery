import { SortOrder } from "./common.interface"

type VoucherTypeVoucher = "SYSTEM" | "RESTAURANT"

type VoucherType = "FOOD" | "SHIP"

type VoucherTypeDiscount = "AMOUNT" | "PERCENT"

type VoucherStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED"

interface CreateVoucherBody {
    name: string
    description?: string
    code: string
    typeVoucher: VoucherTypeVoucher
    type: VoucherType
    typeDiscount: VoucherTypeDiscount
    discountValue: number
    maxDiscount?: number | null
    minPrice?: number
    startDate: string | Date
    endDate: string | Date
    startTime?: string
    endTime?: string
    maxQuantity?: number | null
    restaurantId?: string | null
}

type UpdateVoucherBody = {
    name?: string
    description?: string
    code?: string
    typeVoucher?: VoucherTypeVoucher
    type?: VoucherType
    typeDiscount?: VoucherTypeDiscount
    discountValue?: number
    maxDiscount?: number | null
    minPrice?: number
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
    maxQuantity?: number | null
}

interface GetVouchersQuery {
    search?: string
    typeVoucher?: VoucherTypeVoucher
    type?: VoucherType
    typeDiscount?: VoucherTypeDiscount
    status?: VoucherStatus
    restaurantId?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
    date?: string | Date
}

export { VoucherTypeVoucher, VoucherType, VoucherTypeDiscount, VoucherStatus, CreateVoucherBody, UpdateVoucherBody, GetVouchersQuery }
