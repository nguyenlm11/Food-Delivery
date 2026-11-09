import { Request, Response } from "express"
import { handleChangePassword, handleForgetPassword, handleLogin, handleLogout, handleRefreshToken, handleCustomerRegister, handleResendOTP, handleResetPassword, handleVerifyOTP, handleOwnerRegister, handleGetMe, handleDeleteUser, handleRestoreUser } from "../services/auth.service"
import { AppError } from "../errors/AppError"
import { OwnerParams } from "../interfaces/owner.interface"
import { CustomerRegisterParams } from "../interfaces/user.interface"
import { getIO } from "../configs/socket"

const WEB_ROLES = ["ADMIN", "OWNER", "RESTAURANT"]
const MOBILE_ROLES = ["CUSTOMER", "DRIVER"]

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

    const isStaffLogin = req.originalUrl.split("?")[0].endsWith("/staff-login")
    const allowedRoles = isStaffLogin ? WEB_ROLES : MOBILE_ROLES

    const { accessToken, refreshToken } = await handleLogin(email, password, allowedRoles)
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
    const params: CustomerRegisterParams = req.body

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    const data = await handleCustomerRegister(params)
    return res.status(201).json({
        message: "Register successfully!",
        data: data
    })
}

const ownerRegisterAPI = async (req: Request, res: Response) => {
    const params: OwnerParams = req.body
    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "AUTH_REQUIRED_FIELDS")
    }

    const data = await handleOwnerRegister(params)
    return res.status(201).json({
        message: "Register successfully!",
        data: data
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

const deleteUserAPI = async (req: Request, res: Response) => {
    const userId = String(req.params.userId)
    await handleDeleteUser(userId)

    getIO()
        .to(["admins", `user:${userId}`])
        .emit("user:deleted", { userId })

    return res.status(200).json({
        message: "Delete user successfully!",
    })
}

const restoreUserAPI = async (req: Request, res: Response) => {
    const userId = String(req.params.userId)
    await handleRestoreUser(userId)

    getIO()
        .to(["admins", `user:${userId}`])
        .emit("user:restored", { userId })

    return res.status(200).json({
        message: "Restore user successfully!",
    })
}

export { loginAPI, logoutAPI, refreshTokenAPI, customerRegisterAPI, ownerRegisterAPI, verifyOtpAPI, resendOtpAPI, forgetPasswordAPI, resetPasswordAPI, changePasswordAPI, getMeAPI, deleteUserAPI, restoreUserAPI }
