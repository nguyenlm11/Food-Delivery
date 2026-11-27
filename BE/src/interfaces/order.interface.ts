type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERING" | "DELIVERED" | "CANCELLED"

type PaymentMethod = "WALLET" | "CASH"

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

interface QuoteOrderQuery {
    restaurantId: string
    addressId?: string
    voucherCode?: string
}

interface CreateOrderBody {
    restaurantId: string
    addressId: string
    voucherCode?: string
    paymentMethod: PaymentMethod
    note?: string
}

export { OrderStatus, PaymentMethod, PaymentStatus, QuoteOrderQuery, CreateOrderBody }
 