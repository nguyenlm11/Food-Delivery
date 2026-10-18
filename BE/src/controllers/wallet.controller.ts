import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { handleGetWallet, handleGetWalletTransactions, handleRetryTopUpWallet, handleTopUpWallet, handleVnpayReturn } from "../services/wallet.service"
import { getIO } from "../configs/socket"

const getWalletAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "WALLET_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetWallet(myId)
    return res.status(200).json({
        message: "Get wallet successfully",
        data: data
    })
}

const topUpWalletAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id
    const { amount } = req.body ?? {}
    const myIp = req.ip

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "WALLET_AUTHENTICATION_REQUIRED")
    }

    if (!myIp) {
        throw new AppError("Your IP not found!", 400, "WALLET_CLIENT_IP_MISSING")
    }

    const data = await handleTopUpWallet(myId, amount, myIp)

    getIO()
        .to(`user:${myId}`)
        .emit("wallet:topup", {
            myId,
            amount,
            myIp
        })

    return res.status(201).json({
        data: data
    })
}

const vnpayReturnAPI = async (req: Request, res: Response) => {
    const query = req.query

    const data = await handleVnpayReturn(query)
    return res.status(200).json({
        data: data
    })
}

const getWalletTransactionsAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "WALLET_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetWalletTransactions(myId)
    return res.status(200).json({
        message: "Get wallet transactions successfully!",
        data: data
    })
}

const retryTopUpWalletAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id
    const transactionId = String(req.params.transactionId)
    const myIp = req.ip

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "WALLET_AUTHENTICATION_REQUIRED")
    }

    if (!myIp) {
        throw new AppError("Your IP not found!", 400, "WALLET_CLIENT_IP_MISSING")
    }

    const data = await handleRetryTopUpWallet(myId, transactionId, myIp)

    getIO()
        .to(`user:${myId}`)
        .emit("wallet:retrytopup", {
            myId,
            transactionId,
            myIp
        })

    return res.status(200).json({
        data: data
    })
}

export { getWalletAPI, topUpWalletAPI, vnpayReturnAPI, getWalletTransactionsAPI, retryTopUpWalletAPI }