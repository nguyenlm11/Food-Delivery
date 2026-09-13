import { Request, Response } from "express"
import { handleChangePassword, handleForgetPassword, handleLogin, handleLogout, handleRefreshToken, handleCustomerRegister, handleResendOTP, handleResetPassword, handleVerifyOTP, handleOwnerRegister } from "../services/auth.service";
import { AppError } from "../errors/error";
import { OwnerParams } from "../interfaces/interface";

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
            message: "Logged in successfully",
            data: { accessToken, refreshToken }
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

const customerRegisterAPI = async (req: Request, res: Response) => {
    try {
        const { fullname, email, birthday, address, phone, password } = req.body
        if (!fullname || !email || !birthday || !address || !phone || !password) {
            throw new AppError("Missing required fields", 400)
        }
        const user = await handleCustomerRegister(fullname, email, birthday, address, phone, password)

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

const ownerRegisterAPI = async (req: Request, res: Response) => {
    try {
        const param: OwnerParams = req.body;

        if (!param || Object.keys(param).length === 0) {
            throw new AppError("Request body cannot be empty", 400);
        }

        const result = await handleOwnerRegister(param);

        return res.status(201).json({
            message: "Register successfully!",
            data: result
        });

    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        });
    }
}

const verifyOtpAPI = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            throw new AppError("Missing required fields!", 400)
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

const changePasswordAPI = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body
        const userId = (req as any).user?.id
        if (!userId) {
            throw new AppError("Unauthorized!", 401);
        }

        if (!oldPassword || !newPassword) {
            throw new AppError("Missing required fields", 400)
        }

        await handleChangePassword(userId, oldPassword, newPassword)
        return res.status(200).json({
            message: "Password changed successfully"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const logoutAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        if (!userId) {
            throw new AppError("Unauthorized!", 401);
        }

        await handleLogout(userId)

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        return res.status(200).json({
            message: "Logged out successfully"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { loginAPI, logoutAPI, refreshTokenAPI, customerRegisterAPI, ownerRegisterAPI, verifyOtpAPI, resendOtpAPI, forgetPasswordAPI, resetPasswordAPI, changePasswordAPI }