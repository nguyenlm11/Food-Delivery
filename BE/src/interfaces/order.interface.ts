import { SortOrder } from "./common.interface"

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERING" | "DELIVERED" | "CANCELLED"

type PaymentMethod = "WALLET" | "CASH"

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

interface QuoteOrderQuery {
    restaurantId?: string
    addressId?: string
    voucherId?: string
}

interface CreateOrderBody {
    restaurantId: string
    addressId: string
    voucherId?: string
    paymentMethod: PaymentMethod
    note?: string
}

interface GetOrdersQuery {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    search?: string
    restaurantId?: string
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: SortOrder
}

export { OrderStatus, PaymentMethod, PaymentStatus, QuoteOrderQuery, CreateOrderBody, GetOrdersQuery }
 