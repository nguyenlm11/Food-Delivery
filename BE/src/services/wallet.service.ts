import mongoose from "mongoose"
import crypto from "node:crypto"
import { AppError } from "../errors/error"
import Wallet from "../models/wallet.model"
import WalletTransaction from "../models/wallet_transaction.model"
import { createSecureHash, encodeVnpayParams, getVnpayCreateDate, getVnpayExpireDate, verifySecureHash } from "../utils/vnpay.util"

const handleGetWallet = async (userId: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const wallet = await Wallet.findOne({ userId: userId }).lean()

    if (!wallet) {
        throw new AppError("Wallet not found!", 404)
    }

    return wallet
}

const handleTopUpWallet = async (userId: string, amount: number, clientIp: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    if (!amount || typeof amount !== "number") {
        throw new AppError("Invalid amount!", 400)
    }

    if (amount <= 0) {
        throw new AppError("Amount must be greater than 0!", 400)
    }

    const tmnCode = process.env.VNPAY_TMN_CODE
    const hashSecret = process.env.VNPAY_HASH_SECRET
    const apiUrl = process.env.VNPAY_URL
    const returnUrl = process.env.VNPAY_RETURN_URL

    if (!tmnCode || !hashSecret || !apiUrl || !returnUrl) {
        throw new AppError("VNPAY configuration is missing!", 500)
    }

    const wallet = await Wallet.findOne({ userId: userId })

    if (!wallet) {
        throw new AppError("Wallet not found!", 404)
    }

    const transactionRef = crypto.randomUUID().replace(/-/g, "")

    await WalletTransaction.create({
        walletId: wallet._id,
        type: "TOPUP",
        amount: amount,
        status: "PENDING",
        transactionRef: transactionRef
    })

    const createDate = getVnpayCreateDate()
    const expireDate = getVnpayExpireDate()

    const vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: String(amount * 100),
        vnp_CurrCode: "VND",
        vnp_TxnRef: transactionRef,
        vnp_OrderType: "other",
        vnp_OrderInfo: `Nap tien vi ${userId}`,
        vnp_Locale: "vn",
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: clientIp,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
    }

    const hashData = encodeVnpayParams(vnpParams)
    const secureHash = createSecureHash(vnpParams, hashSecret)
    const paymentUrl = `${apiUrl}?${hashData}&vnp_SecureHash=${secureHash}`

    return paymentUrl
}

const handleVnpayReturn = async (query: Record<string, any>) => {
    const hashSecret = process.env.VNPAY_HASH_SECRET

    if (!hashSecret) {
        throw new AppError("VNPAY configuration is missing!", 500)
    }

    const responseCode = query.vnp_ResponseCode
    const transactionRef = query.vnp_TxnRef
    const transactionNo = query.vnp_TransactionNo
    const isValid = verifySecureHash(query, hashSecret)

    if (!isValid) {
        throw new AppError("Invalid VNPAY signature!", 400)
    }

    const transaction = await WalletTransaction.findOne({ transactionRef: transactionRef })

    if (!transaction) {
        throw new AppError("Transaction not found!", 404)
    }

    if (transaction.status === "SUCCESS") {
        return {
            success: true,
            message: "Transaction already processed",
            code: "ALREADY_PROCESSED",
            transactionRef,
            amount: transaction.amount
        }
    }

    if (transaction.status === "FAILED") {
        return {
            success: false,
            message: "Transaction already failed",
            code: "ALREADY_FAILED",
            transactionRef,
            amount: transaction.amount
        }
    }

    if (responseCode === "00") {
        const wallet = await Wallet.findById(transaction.walletId)

        if (!wallet) {
            throw new AppError("Wallet not found!", 404)
        }

        const balanceBefore = wallet.balance
        const balanceAfter = balanceBefore + transaction.amount
        wallet.balance = balanceAfter

        transaction.status = "SUCCESS"
        transaction.balanceBefore = balanceBefore
        transaction.balanceAfter = balanceAfter
        transaction.vnpTransactionNo = transactionNo

        await wallet.save()
        await transaction.save()

        return {
            success: true,
            message: "Top up successfully",
            code: "SUCCESS",
            transactionRef,
            amount: transaction.amount
        }
    }
    transaction.status = "FAILED"
    await transaction.save()

    return {
        success: false,
        message: `Payment failed (code ${responseCode})`,
        code: "PAYMENT_FAILED",
        transactionRef,
        amount: transaction.amount
    }
}

const handleGetWalletTransactions = async (userId: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid User ID format!", 400)
    }

    const wallet = await Wallet.findOne({ userId })
        .select("_id")
        .lean()

    if (!wallet) {
        throw new AppError("Wallet not found!", 404)
    }

    const transactions = await WalletTransaction.find({ walletId: wallet._id })
        .sort({ createdAt: -1 })
        .lean()

    return transactions
}

export { handleGetWallet, handleTopUpWallet, handleVnpayReturn, handleGetWalletTransactions }