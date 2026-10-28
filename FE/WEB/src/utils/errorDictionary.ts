import type { BackendErrorResponse } from "../types/api"

type ErrorMessageTranslator = (data: unknown) => string

export const errorCodeMap: Record<string, string | ErrorMessageTranslator> = {
    AUTH_ACCESS_TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    AUTH_ACCESS_TOKEN_INVALID: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
    AUTH_ACCESS_TOKEN_MISSING: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
    AUTH_ACCESS_TOKEN_NOT_ACTIVE: "Phiên đăng nhập chưa có hiệu lực. Vui lòng thử lại.",
    AUTH_ACCESS_TOKEN_SECRET_MISSING: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
    AUTH_ACCOUNT_FORBIDDEN: "Tài khoản không có quyền đăng nhập.",
    AUTH_EMAIL_NOT_VERIFIED: "Vui lòng xác thực email trước khi đăng nhập.",
    AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
    AUTH_INVALID_USER_ID: "Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.",
    AUTH_REQUIRED_FIELDS: "Vui lòng điền đầy đủ thông tin bắt buộc.",
    AUTH_ROLE_NOT_ALLOWED: "Tài khoản không có quyền truy cập cổng quản lý.",
    AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
    AUTHORIZATION_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",

    CATEGORY_ALREADY_ACTIVE: "Danh mục đã được kích hoạt.",
    CATEGORY_ALREADY_DELETED: "Danh mục đã được ẩn trước đó.",
    CATEGORY_INVALID_ID: "Mã danh mục không hợp lệ.",
    CATEGORY_NAME_ALREADY_EXISTS: "Tên danh mục đã tồn tại. Vui lòng chọn tên khác.",
    CATEGORY_NOT_FOUND: "Không tìm thấy danh mục.",
}

export function getLocalizedErrorMessage(errorData?: BackendErrorResponse) {
    if (errorData?.code) {
        const localizedMessage = errorCodeMap[errorData.code]

        if (typeof localizedMessage === "string") {
            return localizedMessage
        }

        if (typeof localizedMessage === "function") {
            return localizedMessage(errorData.data)
        }
    }

    const backendMessage = errorData?.message

    return backendMessage || "Đã xảy ra lỗi. Vui lòng thử lại."
}
