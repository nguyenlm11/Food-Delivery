import type { VoucherStatus, VoucherType, VoucherTypeDiscount } from "@/types/voucher.type"

export interface OwnerVoucher {
    _id: string
    name: string
    code: string
    type: VoucherType
    typeDiscount: VoucherTypeDiscount
    discountValue: number
    endDate: string
    status: VoucherStatus
}

export interface OwnerVoucherFilterValues {
    type: "all" | VoucherType
    typeDiscount: "all" | VoucherTypeDiscount
    status: "all" | VoucherStatus
}
