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

    BAD_REQUEST: "Yêu cầu không hợp lệ.",
    UNAUTHORIZED: "Vui lòng đăng nhập để tiếp tục.",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
    NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
    CONFLICT: "Dữ liệu đang tồn tại, không thể thực hiện thao tác.",
    VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
    INTERNAL_SERVER_ERROR: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
    ROUTE_NOT_FOUND: "Không tìm thấy đường dẫn yêu cầu.",

    CATEGORY_ALREADY_ACTIVE: "Danh mục đã được kích hoạt.",
    CATEGORY_ALREADY_DELETED: "Danh mục đã được ẩn trước đó.",
    CATEGORY_INVALID_ID: "Mã danh mục không hợp lệ.",
    CATEGORY_NAME_ALREADY_EXISTS: "Tên danh mục đã tồn tại. Vui lòng chọn tên khác.",
    CATEGORY_NOT_FOUND: "Không tìm thấy danh mục.",
    CATEGORY_REQUIRED_FIELDS: "Vui lòng điền đầy đủ thông tin bắt buộc.",

    CUSTOMER_ALREADY_DELETED: "Khách hàng đã bị xóa trước đó.",
    CUSTOMER_AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
    CUSTOMER_INVALID_BIRTHDAY: "Ngày sinh không hợp lệ.",
    CUSTOMER_INVALID_ID: "Mã khách hàng không hợp lệ.",
    CUSTOMER_INVALID_PHONE: "Số điện thoại không đúng định dạng.",
    CUSTOMER_NOT_FOUND: "Không tìm thấy khách hàng.",
    CUSTOMER_PHONE_ALREADY_EXISTS: "Số điện thoại đã được sử dụng.",
    CUSTOMER_REQUIRED_FIELDS: "Vui lòng điền đầy đủ thông tin bắt buộc.",
    CUSTOMER_ROLE_NOT_FOUND: "Không tìm thấy vai trò khách hàng trong hệ thống.",

    OWNER_ALREADY_DELETED: "Tài khoản chủ nhà hàng đã bị xóa trước đó.",
    OWNER_APPROVAL_ALREADY_PROCESSED: "Yêu cầu xác minh của chủ nhà hàng đã được xử lý.",
    OWNER_APPROVAL_NOT_REJECTED: "Chỉ có thể gửi lại yêu cầu sau khi bị từ chối.",
    OWNER_AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
    OWNER_CITIZEN_FIELDS_REQUIRED: "Vui lòng cung cấp đầy đủ thông tin giấy tờ tùy thân.",
    OWNER_CITIZEN_IMAGES_REQUIRED: "Vui lòng cung cấp ảnh mặt trước và mặt sau giấy tờ tùy thân.",
    OWNER_INVALID_BIRTHDAY: "Ngày sinh không hợp lệ.",
    OWNER_INVALID_CITIZEN_ID: "Số căn cước phải gồm đúng 12 chữ số.",
    OWNER_INVALID_ID: "Mã chủ nhà hàng không hợp lệ.",
    OWNER_INVALID_PHONE: "Số điện thoại không đúng định dạng.",
    OWNER_INVALID_TAX_CODE: "Mã số thuế không hợp lệ. Mã phải có 10 chữ số hoặc theo dạng 10 chữ số-3 chữ số.",
    OWNER_INVALID_USER_ID: "Mã tài khoản chủ nhà hàng không hợp lệ.",
    OWNER_NOT_FOUND: "Không tìm thấy thông tin chủ nhà hàng.",
    OWNER_PHONE_ALREADY_EXISTS: "Số điện thoại đã được sử dụng.",
    OWNER_REJECTION_REASON_REQUIRED: "Vui lòng nhập lý do từ chối.",
    OWNER_USER_NOT_FOUND: "Không tìm thấy tài khoản của chủ nhà hàng.",

    SHIPFEE_AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
    SHIPFEE_BASE_FEE_CANNOT_DELETE: "Không thể xoá phí giao hàng cơ bản.",
    SHIPFEE_BASE_FEE_CANNOT_TOGGLE: "Không thể tạm ngừng phí giao hàng cơ bản.",
    SHIPFEE_DELETED: "Phí giao hàng đã bị xoá.",
    SHIPFEE_HOLIDAY_EXISTS: "Đã tồn tại quy tắc cho ngày lễ này.",
    SHIPFEE_INVALID_BASEFEE: "Phí cơ bản không hợp lệ.",
    SHIPFEE_INVALID_COORDINATES: "Toạ độ không hợp lệ.",
    SHIPFEE_INVALID_DATE: "Ngày không hợp lệ. Vui lòng dùng định dạng DD-MM.",
    SHIPFEE_INVALID_ID: "Mã phí giao hàng không hợp lệ.",
    SHIPFEE_INVALID_MULTIPLIER: "Hệ số nhân không hợp lệ.",
    SHIPFEE_INVALID_PERKMFEE: "Phí mỗi km không hợp lệ.",
    SHIPFEE_INVALID_RESTAURANT_ID: "Mã nhà hàng không hợp lệ.",
    SHIPFEE_INVALID_STATUS: "Trạng thái không hợp lệ.",
    SHIPFEE_INVALID_TIME: "Khoảng thời gian không hợp lệ.",
    SHIPFEE_NOT_FOUND: "Không tìm thấy phí giao hàng.",
    SHIPFEE_REQUIRED_FIELDS: "Vui lòng điền đầy đủ thông tin bắt buộc.",
    SHIPFEE_RESTAURANT_NOT_FOUND: "Không tìm thấy nhà hàng.",
    SHIPFEE_STATUS_UNCHANGED: "Phí giao hàng đã ở trạng thái này.",
    SHIPFEE_TIME_OVERLAP: "Khoảng thời gian bị trùng với một quy tắc đang tồn tại.",
    SHIPFEE_TIME_REQUIRED: "Vui lòng nhập giờ bắt đầu và giờ kết thúc.",
    SHIPFEE_WEEKEND_EXISTS: "Đã tồn tại quy tắc cho cuối tuần.",
    SHIP_FEE_INVALID_TYPE: "Loại phí giao hàng không hợp lệ.",
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
