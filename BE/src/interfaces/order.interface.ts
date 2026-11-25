type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERING" | "DELIVERED" | "CANCELLED"

type PaymentMethod = "WALLET" | "CASH"

type PaymentStatus = "PENDING" | "PAID" | "FAILED"

interface CreateOrderBody {
    restaurantId: string
    addressId: string
    voucherCode?: string
    tipAmount?: number
    note?: string
    paymentMethod: PaymentMethod
}

interface GetOrdersQuery {
    page?: number
    limit?: number
    status?: OrderStatus
    paymentMethod?: PaymentMethod
    paymentStatus?: PaymentStatus
    search?: string
    date?: string
    restaurantId?: string
    driverId?: string
    customerId?: string
    sortBy?: string
    sortOrder?: string
}

interface UpdateOrderStatusBody {
    status: OrderStatus
}

interface CancelOrderBody {
    reason: string
}

export { OrderStatus, PaymentMethod, PaymentStatus, CreateOrderBody, GetOrdersQuery, UpdateOrderStatusBody, CancelOrderBody }
