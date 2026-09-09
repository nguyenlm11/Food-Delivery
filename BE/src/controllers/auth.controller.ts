import { Request, Response } from "express"
import { handleForgetPassword, handleLogin, handleRefreshToken, handleRegister, handleResendOTP, handleResetPassword, handleVerifyOTP } from "../services/auth.service";
import { AppError } from "../errors/error";

const loginAPI = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new AppError("Missing required fields", 400)
        }
        const { accessToken, refreshToken } = await handleLogin(email, password)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Login successfully!",
            data: { accessToken }
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const refreshTokenAPI = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken
        if (!refreshToken) {
            throw new AppError("Refresh token is missing!", 401);
        }

        const newAccessToken = await handleRefreshToken(refreshToken)
        return res.status(200).json({
            message: "Token refreshed successfully!",
            data: { accessToken: newAccessToken }
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const registerAPI = async (req: Request, res: Response) => {
    try {
        const { fullname, email, birthday, address, phone, password, roleId } = req.body
        if (!fullname || !email || !birthday || !address || !phone || !password || !roleId) {
            throw new AppError("Missing required fields", 400)
        }
        const user = await handleRegister(fullname, email, birthday, address, phone, password, roleId)

        return res.status(201).json({
            message: "Register successfully!",
            data: user
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const verifyOtpAPI = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body
        if (!email) {
            throw new AppError("Email is required!", 400)
        }

        await handleVerifyOTP(email, otp)
        return res.status(200).json({
            message: "Account successfully verified"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const resendOtpAPI = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new AppError("Email is required!", 400)
        }

        await handleResendOTP(email)
        return res.status(201).json({
            message: "OTP has been resent to your email"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const forgetPasswordAPI = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new AppError("Email is required!", 400)
        }

        await handleForgetPassword(email)
        return res.status(200).json({
            message: "OTP has been sent to your email"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const resetPasswordAPI = async (req: Request, res: Response) => {
    try {
        const { email, otp, password } = req.body
        if (!email || !otp || !password) {
            throw new AppError("Missing required fields", 400)
        }

        if (password.length < 6) {
            throw new AppError("Password must be at least 6 characters!", 400);
        }

        await handleResetPassword(email, otp, password)
        return res.status(200).json({
            message: "The new password has been reset"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { loginAPI, refreshTokenAPI, registerAPI, verifyOtpAPI, resendOtpAPI, forgetPasswordAPI, resetPasswordAPI }