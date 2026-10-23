import { Request, Response } from "express"
import { handleChangePassword, handleForgetPassword, handleLogin, handleLogout, handleRefreshToken, handleCustomerRegister, handleResendOTP, handleResetPassword, handleVerifyOTP, handleOwnerRegister, handleGetMe } from "../services/auth.service"
import { AppError } from "../errors/AppError"
import { OwnerParams } from "../interfaces/owner.interface"

const refreshCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
    partitioned: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const loginAPI = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    const { accessToken, refreshToken } = await handleLogin(email, password)
    res.cookie("refreshToken", refreshToken, refreshCookieOptions)

    return res.status(200).json({
        message: "Logged in successfully",
        data: { accessToken, refreshToken }
    })
}

const refreshTokenAPI = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
        throw new AppError("Refresh token is missing!", 401, "AUTH_REFRESH_TOKEN_MISSING")
    }

    const newAccessToken = await handleRefreshToken(refreshToken)
    return res.status(200).json({
        message: "Token refreshed successfully!",
        data: { accessToken: newAccessToken }
    })
}

const customerRegisterAPI = async (req: Request, res: Response) => {
    const { fullname, email, birthday, address, phone, password } = req.body ?? {}
    if (!fullname || !email || !birthday || !address || !phone || !password) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    const user = await handleCustomerRegister(fullname, email, birthday, address, phone, password)
    return res.status(201).json({
        message: "Register successfully!",
        data: user
    })
}

const ownerRegisterAPI = async (req: Request, res: Response) => {
    const param: OwnerParams = req.body
    if (!param || Object.keys(param).length === 0) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    const result = await handleOwnerRegister(param)
    return res.status(201).json({
        message: "Register successfully!",
        data: result
    })
}

const verifyOtpAPI = async (req: Request, res: Response) => {
    const { email, otp } = req.body ?? {}
    if (!email || !otp) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    await handleVerifyOTP(email, otp)
    return res.status(200).json({
        message: "Account successfully verified"
    })
}

const resendOtpAPI = async (req: Request, res: Response) => {
    const { email } = req.body ?? {}
    if (!email) {
        throw new AppError("Email is required!", 400, "AUTH_EMAIL_REQUIRED")
    }

    await handleResendOTP(email)
    return res.status(201).json({
        message: "OTP has been resent to your email"
    })
}

const forgetPasswordAPI = async (req: Request, res: Response) => {
    const { email } = req.body ?? {}
    if (!email) {
        throw new AppError("Email is required!", 400, "AUTH_EMAIL_REQUIRED")
    }

    await handleForgetPassword(email)
    return res.status(200).json({
        message: "OTP has been sent to your email"
    })
}

const resetPasswordAPI = async (req: Request, res: Response) => {
    const { email, otp, password } = req.body ?? {}
    if (!email || !otp || !password) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters!", 400, "AUTH_INVALID_PASSWORD")
    }

    await handleResetPassword(email, otp, password)
    return res.status(200).json({
        message: "The new password has been reset"
    })
}

const changePasswordAPI = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body ?? {}
    const userId = (req as any).user?.id
    if (!userId) {
        throw new AppError("Unauthorized!", 401, "AUTHENTICATION_REQUIRED")
    }

    if (!oldPassword || !newPassword) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    await handleChangePassword(userId, oldPassword, newPassword)
    return res.status(200).json({
        message: "Password changed successfully"
    })
}

const logoutAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    if (!userId) {
        throw new AppError("Unauthorized!", 401, "AUTHENTICATION_REQUIRED")
    }

    await handleLogout(userId)
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken", refreshCookieOptions)

    return res.status(200).json({
        message: "Logged out successfully"
    })
}

const getMeAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id
    if (!myId) {
        throw new AppError("Unauthorized!", 401, "AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetMe(myId)
    return res.status(200).json({
        message: "Get customer information successfully!",
        data: data
    })
}

export { loginAPI, logoutAPI, refreshTokenAPI, customerRegisterAPI, ownerRegisterAPI, verifyOtpAPI, resendOtpAPI, forgetPasswordAPI, resetPasswordAPI, changePasswordAPI, getMeAPI }