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

    VOUCHER_ACCESS_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này trên mã khuyến mãi này.",
    VOUCHER_ALREADY_INACTIVE: "Mã khuyến mãi này đã ở trạng thái tạm ẩn.",
    VOUCHER_AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
    VOUCHER_CODE_ALREADY_EXISTS: "Mã khuyến mãi đã tồn tại. Vui lòng chọn mã khác.",
    VOUCHER_CODE_REQUIRED: "Vui lòng nhập mã khuyến mãi.",
    VOUCHER_DATES_REQUIRED: "Vui lòng chọn ngày bắt đầu và ngày kết thúc.",
    VOUCHER_EXPIRED: "Mã khuyến mãi đã hết hạn.",
    VOUCHER_INVALID_CATEGORY: "Loại áp dụng không hợp lệ.",
    VOUCHER_INVALID_CREATOR_ID: "Mã người tạo không hợp lệ.",
    VOUCHER_INVALID_DATE: "Ngày không hợp lệ.",
    VOUCHER_INVALID_DATE_RANGE: "Ngày kết thúc không được trước ngày bắt đầu.",
    VOUCHER_INVALID_DISCOUNT_PERCENT: "Phần trăm chiết khấu không được vượt quá 100%.",
    VOUCHER_INVALID_DISCOUNT_TYPE: "Loại chiết khấu không hợp lệ.",
    VOUCHER_INVALID_DISCOUNT_VALUE: "Giá trị chiết khấu phải lớn hơn 0.",
    VOUCHER_INVALID_END_TIME: "Giờ kết thúc không hợp lệ. Vui lòng dùng định dạng HH:mm.",
    VOUCHER_INVALID_FILTER_DATE: "Ngày lọc không hợp lệ. Vui lòng dùng định dạng DD-MM-YYYY.",
    VOUCHER_INVALID_ID: "Mã khuyến mãi không hợp lệ.",
    VOUCHER_INVALID_LIMIT: "Số lượng bản ghi mỗi trang không hợp lệ.",
    VOUCHER_INVALID_MAX_DISCOUNT: "Mức chiết khấu tối đa không hợp lệ.",
    VOUCHER_INVALID_MAX_QUANTITY: "Số lượt sử dụng tối đa không hợp lệ.",
    VOUCHER_INVALID_MIN_PRICE: "Giá trị đơn hàng tối thiểu không hợp lệ.",
    VOUCHER_INVALID_PAGE: "Số trang không hợp lệ.",
    VOUCHER_INVALID_RESTAURANT_ID: "Mã nhà hàng không hợp lệ.",
    VOUCHER_INVALID_START_TIME: "Giờ bắt đầu không hợp lệ. Vui lòng dùng định dạng HH:mm.",
    VOUCHER_INVALID_STATUS: "Trạng thái không hợp lệ.",
    VOUCHER_INVALID_TIME_RANGE: "Giờ kết thúc không được trước giờ bắt đầu trong cùng một ngày.",
    VOUCHER_INVALID_TYPE: "Loại mã khuyến mãi không hợp lệ.",
    VOUCHER_INVALID_UPDATE_FIELD: "Có trường không được hỗ trợ trong bản cập nhật.",
    VOUCHER_MAX_QUANTITY_BELOW_USED: "Số lượt sử dụng tối đa không được nhỏ hơn số lượt đã dùng.",
    VOUCHER_NAME_REQUIRED: "Vui lòng nhập tên khuyến mãi.",
    VOUCHER_NOT_FOUND: "Không tìm thấy mã khuyến mãi.",
    VOUCHER_REQUIRED_FIELDS: "Vui lòng điền đầy đủ thông tin bắt buộc.",
    VOUCHER_RESTAURANT_NOT_FOUND: "Không tìm thấy nhà hàng.",
    VOUCHER_STATUS_REQUIRED: "Vui lòng chọn trạng thái mã khuyến mãi.",
    VOUCHER_STATUS_UNCHANGED: "Mã khuyến mãi đã ở trạng thái này.",
    VOUCHER_SYSTEM_RESTAURANT_NOT_ALLOWED: "Mã khuyến mãi của hệ thống không được thuộc nhà hàng.",
    VOUCHER_UPDATE_FIELDS_REQUIRED: "Vui lòng điền đầy đủ thông tin cần cập nhật.",
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
