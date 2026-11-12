import type { ActionConfig } from "@/types/api"

export const categoryActionConfig: Record<string, ActionConfig> = {
    hide: {
        label: "Tạm ẩn",
        title: "Tạm ẩn",
        description: "Danh mục sẽ không còn hiển thị cho khách hàng.",
        confirmLabel: "Ẩn danh mục",
        message: "Danh mục đã được ẩn thành công."
    },
    restore: {
        label: "Khôi phục",
        title: "Khôi phục",
        description: "Danh mục sẽ được hiển thị lại cho khách hàng.",
        confirmLabel: "Khôi phục",
        message: "Danh mục đã được khôi phục thành công."
    },
    restoreDeleted: {
        label: "Khôi phục từ thùng rác",
        title: "Khôi phục",
        description: "Danh mục sẽ được khôi phục lại từ thùng rác.",
        confirmLabel: "Khôi phục",
        message: "Danh mục đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        label: "Xóa",
        title: "Xóa",
        description: "Danh mục sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        confirmLabel: "Xóa danh mục",
        message: "Danh mục đã được xóa thành công."
    }
}

export const shipFeeActionConfig: Record<string, ActionConfig> = {
    hide: {
        label: "Tạm ngừng",
        title: "Tạm ngừng",
        description: "Phí giao hàng sẽ không còn được áp dụng khi tính phí giao hàng.",
        confirmLabel: "Tạm ngừng",
        message: "Phí giao hàng đã được ẩn thành công."
    },
    restore: {
        label: "Khôi phục",
        title: "Khôi phục",
        description: "Phí giao hàng sẽ được áp dụng trở lại khi tính phí giao hàng.",
        confirmLabel: "Khôi phục",
        message: "Phí giao hàng đã được khôi phục thành công."
    },
    restoreDeleted: {
        label: "Khôi phục từ thùng rác",
        title: "Khôi phục",
        description: "Phí giao hàng sẽ được khôi phục lại từ thùng rác.",
        confirmLabel: "Khôi phục",
        message: "Phí giao hàng đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        label: "Xóa",
        title: "Xóa",
        description: "Phí giao hàng sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        confirmLabel: "Xóa",
        message: "Phí giao hàng đã được xóa thành công."
    }
}

export const voucherActionConfig: Record<string, ActionConfig> = {
    hide: {
        label: "Tạm ngừng",
        title: "Tạm ngừng",
        description: "Mã giảm giá sẽ không còn được sử dụng bởi khách hàng.",
        confirmLabel: "Tạm ngừng",
        message: "Mã giảm giá đã được tạm ngừng thành công."
    },
    restore: {
        label: "Khôi phục",
        title: "Khôi phục",
        description: "Mã giảm giá sẽ được sử dụng trở lại bởi khách hàng.",
        confirmLabel: "Khôi phục",
        message: "Mã giảm giá đã được khôi phục thành công."
    },
    restoreDeleted: {
        label: "Khôi phục từ thùng rác",
        title: "Khôi phục",
        description: "Mã giảm giá sẽ được khôi phục lại từ thùng rác.",
        confirmLabel: "Khôi phục",
        message: "Mã giảm giá đã được khôi phục từ thùng rác thành công."
    },
    delete: {
        label: "Xóa",
        title: "Xóa",
        description: "Mã giảm giá sẽ bị xóa khỏi hệ thống và có thể khôi phục lại sau.",
        confirmLabel: "Xóa",
        message: "Mã giảm giá đã được xóa thành công."
    }
}

export const customerActionConfig: Record<string, ActionConfig> = {
    delete: {
        label: "Xóa",
        title: "Xóa",
        description: "Tài khoản khách hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập.",
        confirmLabel: "Xóa khách hàng",
        message: "Khách hàng đã được xóa thành công."
    },
    block: {
        label: "Chặn",
        title: "Chặn",
        description: "Tài khoản khách hàng sẽ bị chặn và không thể đăng nhập.",
        confirmLabel: "Chặn khách hàng",
        message: "Khách hàng đã được chặn thành công."
    },
    unblock: {
        label: "Bỏ chặn",
        title: "Bỏ chặn",
        description: "Tài khoản khách hàng sẽ được bỏ chặn và đăng nhập trở lại.",
        confirmLabel: "Bỏ chặn khách hàng",
        message: "Khách hàng đã được bỏ chặn thành công."
    },
    restoreDeleted: {
        label: "Khôi phục từ thùng rác",
        title: "Khôi phục",
        description: "Tài khoản khách hàng sẽ được khôi phục lại từ thùng rác và hoạt động trở lại.",
        confirmLabel: "Khôi phục khách hàng",
        message: "Khách hàng đã được khôi phục thành công."
    }
}

export const ownerActionConfig: Record<string, ActionConfig> = {
    approve: {
        label: "Duyệt yêu cầu",
        title: "Duyệt",
        description: "Chủ nhà hàng sẽ được xác minh và có thể tiếp tục sử dụng các chức năng dành cho đối tác.",
        confirmLabel: "Duyệt",
        message: "Đã duyệt chủ nhà hàng thành công."
    },
    reject: {
        label: "Từ chối yêu cầu",
        title: "Từ chối",
        description: "Yêu cầu xác minh của chủ nhà hàng sẽ bị từ chối.",
        confirmLabel: "Từ chối",
        message: "Đã từ chối yêu cầu của chủ nhà hàng.",
        reasonLabel: "Lý do từ chối",
    },
    delete: {
        label: "Xóa tài khoản",
        title: "Xóa tài khoản của",
        description: "Tài khoản chủ nhà hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập.",
        confirmLabel: "Xóa tài khoản",
        message: "Tài khoản chủ nhà hàng đã được xóa thành công."
    },
    block: {
        label: "Chặn tài khoản",
        title: "Chặn tài khoản của",
        description: "Tài khoản chủ nhà hàng sẽ bị chặn và không thể đăng nhập.",
        confirmLabel: "Chặn tài khoản",
        message: "Tài khoản chủ nhà hàng đã được chặn thành công."
    },
    unblock: {
        label: "Bỏ chặn tài khoản",
        title: "Bỏ chặn tài khoản của",
        description: "Tài khoản chủ nhà hàng sẽ được bỏ chặn và đăng nhập trở lại.",
        confirmLabel: "Bỏ chặn tài khoản",
        message: "Tài khoản chủ nhà hàng đã được bỏ chặn thành công."
    },
    restoreDeleted: {
        label: "Khôi phục tài khoản",
        title: "Khôi phục tài khoản của",
        description: "Tài khoản chủ nhà hàng sẽ được khôi phục lại từ thùng rác và hoạt động trở lại.",
        confirmLabel: "Khôi phục tài khoản",
        message: "Tài khoản chủ nhà hàng đã được khôi phục thành công."
    }
}
