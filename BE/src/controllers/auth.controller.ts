import { Request, Response } from "express"
import { handleRegister, handleResendOTP, handleVerifyOTP } from "../services/auth.service";
import { AppError } from "../errors/error";

const registerAPI = async (req: Request, res: Response) => {
    try {
        const { fullname, email, birthday, address, phone, password, roleId } = req.body
        if (!fullname || !email || !birthday || !address || !phone || !password || !roleId) {
            throw new AppError("Missing required fields", 400);
        }
        const user = await handleRegister(fullname, email, birthday, address, phone, password, roleId)

        return res.status(201).json({
            message: "Register successfully!",
            data: user
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        });
    }
}

const verifyOtpAPI = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body
        if (!email) {
            throw new AppError("Email is required!", 400);
        }

        await handleVerifyOTP(email, otp)
        return res.status(200).json({
            message: "Account successfully verified"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        });
    }
}

const resendOtpAPI = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new AppError("Email is required!", 400);
        }

        await handleResendOTP(email)
        return res.status(201).json({
            message: "OTP has been resent to your email"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        });
    }
}

export { registerAPI, verifyOtpAPI, resendOtpAPI }