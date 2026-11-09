type StatusItem = {
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
    REJECTED: { label: "Từ chối", tone: "error" }
}

export const shipFeeStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ngừng", tone: "warning" },
    DELETED: { label: "Đã xóa", tone: "error" }
}

export const voucherStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ngừng", tone: "warning" }
}

export const categoryStatusConfig: Record<string, StatusItem> = {
    ACTIVE: { label: "Khả dụng", tone: "success" },
    INACTIVE: { label: "Tạm ẩn", tone: "warning" }
}
