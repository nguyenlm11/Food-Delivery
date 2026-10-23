interface CreateVoucherParams {
    name: string
    description?: string
    code: string
    typeVoucher: "SYSTEM" | "RESTAURANT"
    type: "FOOD" | "SHIP"
    typeDiscount: "AMOUNT" | "PERCENT"
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

interface VoucherSearchQuery {
    search?: string
    typeVoucher?: "SYSTEM" | "RESTAURANT"
    type?: "FOOD" | "SHIP"
    typeDiscount?: "AMOUNT" | "PERCENT"
    status?: "ACTIVE" | "INACTIVE"
    restaurantId?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
    date?: Date
}

export { CreateVoucherParams, VoucherSearchQuery }