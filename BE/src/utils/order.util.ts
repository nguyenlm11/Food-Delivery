import { AppError } from "../errors/AppError"
import { OrderStatus } from "../interfaces/order.interface"

// Đơn chỉ đi đúng 1 hướng, không nhảy trạng thái tùy ý
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["DELIVERING", "CANCELLED"],
    DELIVERING: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: []
}

const canTransitionOrder = (current: OrderStatus, next: OrderStatus): boolean => {
    return (ORDER_STATUS_TRANSITIONS[current] ?? []).includes(next)
}

interface VoucherDiscountInput {
    type: "FOOD" | "SHIP"
    typeDiscount: "AMOUNT" | "PERCENT"
    discountValue: number
    maxDiscount: number | null
    minPrice: number
}

// Voucher giảm trên tiền món (FOOD) hoặc tiền ship (SHIP), không bao giờ vượt quá giá trị gốc
const calculateVoucherDiscount = (voucher: VoucherDiscountInput, foodAmount: number, shipFee: number): number => {
    const base = voucher.type === "SHIP" ? shipFee : foodAmount

    if (base < voucher.minPrice) {
        throw new AppError(
            voucher.type === "SHIP"
                ? "This voucher does not apply to your shipping fee!"
                : "This voucher requires a higher order value!",
            400,
            "ORDER_VOUCHER_NOT_APPLICABLE"
        )
    }

    const discount = voucher.typeDiscount === "PERCENT"
        ? base * (voucher.discountValue / 100)
        : voucher.discountValue

    return Math.min(discount, voucher.maxDiscount ?? discount, base)
}

export { ORDER_STATUS_TRANSITIONS, canTransitionOrder, calculateVoucherDiscount }
export type { VoucherDiscountInput }
