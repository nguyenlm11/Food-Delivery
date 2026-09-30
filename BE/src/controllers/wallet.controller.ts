import { Request, Response } from "express"
import { AppError } from "../errors/error"
import { handleGetWallet } from "../services/wallet.service"

const getWalletAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        const data = await handleGetWallet(myId)
        return res.status(200).json({
            message: "Get wallet successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { getWalletAPI }