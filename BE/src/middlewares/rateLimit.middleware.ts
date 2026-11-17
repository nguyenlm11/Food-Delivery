import rateLimit from "express-rate-limit"

export const generalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    message: {
        success: false,
        code: "TOO_MANY_REQUESTS",
        message: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau."
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const authRateLimit = rateLimit({
    windowMs: 60 * 1000, 
    limit: 10,
    message: {
        success: false,
        code: "TOO_MANY_REQUESTS",
        message: "Bạn gửi quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau."
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const otpRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        code: "TOO_MANY_OTP_REQUESTS",
        message: "Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau."
    },
    standardHeaders: true,
    legacyHeaders: false
})