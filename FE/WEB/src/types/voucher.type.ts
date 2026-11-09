export interface GetAllVoucherParams {
    search?: string
    typeVoucher?: "SYSTEM" | "RESTAURANT"
    type?: "FOOD" | "SHIP"
    typeDiscount?: "AMOUNT" | "PERCENT"
    status?: "ACTIVE" | "INACTIVE" | "EXPIRED"
    restaurantId?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: "asc" | "desc"
    date?: string
}

