import type { ActionConfig } from "@/types/api"

export const categoryActionConfig: Record<string, ActionConfig> = {
    hide: {
        description: "Danh mục sẽ không còn hiển thị cho khách hàng.",
        message: "Danh mục đã được ẩn thành công."
    },
    restore: {
        description: "Danh mục sẽ được hiển thị lại cho khách hàng.",
        message: "Danh mục đã được khôi phục thành công."
    },
    restoreDeleted: {
        description: "Danh mục sẽ được khôi phục lại từ thùng rác.",
        message: "Danh mục đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        description: "Danh mục sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        message: "Danh mục đã được xóa thành công."
    }
}

export const shipFeeActionConfig: Record<string, ActionConfig> = {
    hide: {
        description: "Phí giao hàng sẽ không còn được áp dụng khi tính phí giao hàng.",
        message: "Phí giao hàng đã được ẩn thành công."
    },
    restore: {
        description: "Phí giao hàng sẽ được áp dụng trở lại khi tính phí giao hàng.",
        message: "Phí giao hàng đã được khôi phục thành công."
    },
    restoreDeleted: {
        description: "Phí giao hàng sẽ được khôi phục lại từ thùng rác.",
        message: "Phí giao hàng đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        description: "Phí giao hàng sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        message: "Phí giao hàng đã được xóa thành công."
    }
}

export const voucherActionConfig: Record<string, ActionConfig> = {
    hide: {
        description: "Mã giảm giá sẽ không còn được sử dụng bởi khách hàng.",
        message: "Mã giảm giá đã được tạm ngừng thành công."
    },
    restore: {
        description: "Mã giảm giá sẽ được sử dụng trở lại bởi khách hàng.",
        message: "Mã giảm giá đã được khôi phục thành công."
    },
    restoreDeleted: {
        description: "Mã giảm giá sẽ được khôi phục lại từ thùng rác.",
        message: "Mã giảm giá đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        description: "Mã giảm giá sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        message: "Mã giảm giá đã được xóa thành công."
    }
}

export const customerActionConfig: Record<string, ActionConfig> = {
    delete: {
        description: "Tài khoản khách hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập.",
        message: "Khách hàng đã được xóa thành công."
    },
    block: {
        description: "Tài khoản khách hàng sẽ bị chặn và không thể đăng nhập.",
        message: "Khách hàng đã được chặn thành công."
    },
    unblock: {
        description: "Tài khoản khách hàng sẽ được bỏ chặn và đăng nhập trở lại.",
        message: "Khách hàng đã được bỏ chặn thành công."
    },
    restoreDeleted: {
        description: "Tài khoản khách hàng sẽ được khôi phục lại từ thùng rác và hoạt động trở lại.",
        message: "Khách hàng đã được khôi phục thành công."
    }
}

export const ownerActionConfig: Record<string, ActionConfig> = {
    approve: {
        description: "Chủ nhà hàng sẽ được xác minh và có thể tiếp tục sử dụng các chức năng dành cho đối tác.",
        message: "Đã duyệt chủ nhà hàng thành công."
    },
    reject: {
        description: "Yêu cầu xác minh của chủ nhà hàng sẽ bị từ chối.",
        message: "Đã từ chối yêu cầu của chủ nhà hàng.",
        reasonLabel: "Lý do từ chối"
    },
    delete: {
        description: "Tài khoản chủ nhà hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập.",
        message: "Tài khoản chủ nhà hàng đã được xóa thành công."
    },
    block: {
        description: "Tài khoản chủ nhà hàng sẽ bị chặn và không thể đăng nhập.",
        message: "Tài khoản chủ nhà hàng đã được chặn thành công."
    },
    unblock: {
        description: "Tài khoản chủ nhà hàng sẽ được bỏ chặn và đăng nhập trở lại.",
        message: "Tài khoản chủ nhà hàng đã được bỏ chặn thành công."
    },
    restoreDeleted: {
        description: "Tài khoản chủ nhà hàng sẽ được khôi phục lại từ thùng rác và hoạt động trở lại.",
        message: "Tài khoản chủ nhà hàng đã được khôi phục thành công."
    }
}

export const driverActionConfig: Record<string, ActionConfig> = {
    delete: {
        description: "Tài khoản tài xế sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập.",
        message: "Tài khoản tài xế đã được xóa thành công."
    },
    block: {
        description: "Tài khoản tài xế sẽ bị chặn và không thể đăng nhập.",
        message: "Tài khoản tài xế đã được chặn thành công."
    },
    unblock: {
        description: "Tài khoản tài xế sẽ được bỏ chặn và đăng nhập trở lại.",
        message: "Tài khoản tài xế đã được bỏ chặn thành công."
    },
    restoreDeleted: {
        description: "Tài khoản tài xế sẽ được khôi phục lại từ thùng rác và hoạt động trở lại.",
        message: "Tài khoản tài xế đã được khôi phục thành công."
    }
}

export const restaurantActionConfig: Record<string, ActionConfig> = {
    approve: {
        description: "Quán ăn sẽ được xác minh và hoạt động trở lại trên hệ thống.",
        message: "Đã duyệt quán ăn thành công."
    },
    reject: {
        description: "Yêu cầu xác minh của quán ăn sẽ bị từ chối.",
        message: "Đã từ chối yêu cầu của quán ăn.",
        reasonLabel: "Lý do từ chối"
    },
    delete: {
        description: "Quán ăn sẽ được chuyển sang trạng thái đã xóa và không còn hiển thị trên hệ thống.",
        message: "Quán ăn đã được xóa thành công."
    },
    restoreDeleted: {
        description: "Quán ăn sẽ được khôi phục lại từ thùng rác.",
        message: "Quán ăn đã được khôi phục từ thùng rác thành công."
    }
}

export const menuActionConfig: Record<string, ActionConfig> = {
    hide: {
        description: "Thực đơn sẽ không còn hiển thị cho khách hàng.",
        message: "Thực đơn đã được ẩn thành công."
    },
    restore: {
        description: "Thực đơn sẽ được hiển thị lại cho khách hàng.",
        message: "Thực đơn đã được khôi phục thành công."
    },
    restoreDeleted: {
        description: "Thực đơn sẽ được khôi phục lại từ thùng rác.",
        message: "Thực đơn đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        description: "Thực đơn sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        message: "Thực đơn đã được xóa thành công."
    }
}

export const foodActionConfig: Record<string, ActionConfig> = {
    hide: {
        description: "Món ăn sẽ tạm ngừng được hiển thị trên hệ thống.",
        message: "Món ăn đã được tạm ngừng thành công."
    },
    restore: {
        description: "Món ăn sẽ được hiển thị lại trên hệ thống.",
        message: "Món ăn đã được khôi phục thành công."
    },
    restoreDeleted: {
        description: "Món ăn sẽ được khôi phục lại từ thùng rác.",
        message: "Món ăn đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        description: "Món ăn sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        message: "Món ăn đã được xóa thành công."
    }
}

export const modifierActionConfig: Record<string, ActionConfig> = {
    hide: {
        description: "Nhóm tùy chọn sẽ không còn áp dụng cho món ăn.",
        message: "Nhóm tùy chọn đã được ẩn thành công."
    },
    restore: {
        description: "Nhóm tùy chọn sẽ được áp dụng lại cho món ăn.",
        message: "Nhóm tùy chọn đã được khôi phục thành công."
    },
    restoreDeleted: {
        description: "Nhóm tùy chọn sẽ được khôi phục lại từ thùng rác.",
        message: "Nhóm tùy chọn đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        description: "Nhóm tùy chọn sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        message: "Nhóm tùy chọn đã được xóa thành công."
    }
}
