import { Request, Response } from "express"
import { handleRegister, handleVerifyOTP } from "../services/auth.service";

const registerAPI = async (req: Request, res: Response) => {
    try {
        const { fullname, email, birthday, address, phone, password, roleId } = req.body
        if (!fullname || !email || !birthday || !address || !phone || !password || !roleId) {
            return res.status(400).json({
                message: "Missing required fields!",
            })
        }
        const user = await handleRegister(fullname, email, birthday, address, phone, password, roleId)

        return res.status(201).json({
            message: "Register successfully!",
            data: user
        })
    }
    catch (error: any) {
        return res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
}

const verifyOtpAPI = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body
        if (!email) {
            return res.status(400).json({
                message: "Missing required fields!",
            })
        }

        await handleVerifyOTP(email, otp)
        return res.status(200).json({
            message: "Account successfully verified"
        })
    }
    catch (error: any) {
        return res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
}

export { registerAPI, verifyOtpAPI }