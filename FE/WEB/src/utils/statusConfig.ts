export type StatusItem = {
    label: string
    tone: "success" | "warning" | "error" | "neutral" | "brand" | "info"
}

export const userStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Hoạt động", tone: "success" },
    INACTIVE: { label: "Không hoạt động", tone: "warning" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    BLOCKED: { label: "Bị chặn", tone: "error" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const approvalStatusConfig: Record<string, StatusItem> = {
    APPROVED: { label: "Đã xác nhận", tone: "success" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    REJECTED: { label: "Đã từ chối", tone: "error" }
}

export const shipFeeStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ngừng", tone: "warning" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const voucherStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ngừng", tone: "warning" },
    EXPIRED: { label: "Hết hạn", tone: "error" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const categoryStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ẩn", tone: "warning" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const restaurantStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Hoạt động", tone: "success" },
    INACTIVE: { label: "Không hoạt động", tone: "warning" },
    CLOSED: { label: "Đã đóng cửa", tone: "neutral" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const menuStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ẩn", tone: "warning" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const foodStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Đang bán", tone: "success" },
    INACTIVE: { label: "Tạm ngừng", tone: "warning" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const modifierStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ẩn", tone: "warning" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const driverPresenceConfig: Record<string, StatusItem> = {
    ONLINE: { label: "Đang hoạt động", tone: "success" },
    OFFLINE: { label: "Đang ngoại tuyến", tone: "neutral" }
}

export const driverWorkConfig: Record<string, StatusItem> = {
    IDLE: { label: "Sẵn sàng nhận đơn", tone: "success" },
    BUSY: { label: "Đang giao hàng", tone: "warning" },
    OFF_DUTY: { label: "Đã tạm ngừng", tone: "neutral" }
}