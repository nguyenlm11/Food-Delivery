import { Request, Response } from "express"
import { AppError } from "../errors/error"
import { handleGetWallet, handleTopUpWallet, handleVnpayReturn } from "../services/wallet.service"

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

const topUpWalletAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id
        const { amount } = req.body
        const myIp = req.ip

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!myIp) {
            throw new AppError("Your IP not found!", 400)
        }

        const data = await handleTopUpWallet(myId, amount, myIp)
        return res.status(200).json({
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

const vnpayReturnAPI = async (req: Request, res: Response) => {
    try {
        const query = req.query

        const data = await handleVnpayReturn(query)
        return res.status(200).json({
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

export { getWalletAPI, topUpWalletAPI, vnpayReturnAPI }