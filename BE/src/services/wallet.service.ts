import mongoose from "mongoose"
import crypto from "node:crypto"
import { AppError } from "../errors/AppError"
import { Wallet, WalletTransaction } from "../models/wallet.model"
import { createSecureHash, encodeVnpayParams, getVnpayCreateDate, getVnpayExpireDate, verifySecureHash } from "../utils/vnpay.util"
import { roundAmount } from "../utils/helper"

const handleGetWallet = async (userId: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "WALLET_INVALID_USER_ID")
    }

    const wallet = await Wallet
        .findOne({ userId: userId })
        .lean()

    if (!wallet) {
        throw new AppError("Wallet not found!", 404, "WALLET_NOT_FOUND")
    }

    return wallet
}

const handleTopUpWallet = async (userId: string, amount: number, clientIp: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "WALLET_INVALID_USER_ID")
    }

    if (!amount || typeof amount !== "number") {
        throw new AppError("Invalid amount!", 400, "WALLET_INVALID_AMOUNT")
    }

    if (amount <= 0) {
        throw new AppError("Amount must be greater than 0!", 400, "WALLET_INVALID_AMOUNT")
    }

    const topUpAmount = roundAmount(amount)

    const tmnCode = process.env.VNPAY_TMN_CODE
    const hashSecret = process.env.VNPAY_HASH_SECRET
    const apiUrl = process.env.VNPAY_URL
    const returnUrl = process.env.VNPAY_RETURN_URL

    if (!tmnCode || !hashSecret || !apiUrl || !returnUrl) {
        throw new AppError("VNPAY configuration is missing!", 500, "WALLET_VNPAY_CONFIGURATION_MISSING")
    }

    const wallet = await Wallet.findOne({ userId: userId })

    if (!wallet) {
        throw new AppError("Wallet not found!", 404, "WALLET_NOT_FOUND")
    }

    const transactionRef = crypto.randomUUID().replace(/-/g, "")

    await WalletTransaction.create({
        walletId: wallet._id,
        type: "TOPUP",
        amount: topUpAmount,
        status: "PENDING",
        transactionRef: transactionRef
    })

    const createDate = getVnpayCreateDate()
    const expireDate = getVnpayExpireDate()

    const vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: String(topUpAmount * 100),
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

const handleRetryTopUpWallet = async (userId: string, transactionId: string, clientIp: string) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(transactionId)) {
        throw new AppError("Invalid ID format!", 400, "WALLET_INVALID_ID")
    }

    const transaction = await WalletTransaction.findById(transactionId)

    if (!transaction) {
        throw new AppError("Transaction not found!", 404, "WALLET_TRANSACTION_NOT_FOUND")
    }

    if (transaction.status !== "PENDING") {
        throw new AppError("Transaction is no longer pending!", 400, "WALLET_TRANSACTION_NOT_PENDING")
    }

    const expireTime = new Date(Date.now() - 15 * 60 * 1000)

    if (transaction.createdAt < expireTime) {
        throw new AppError("Transaction has expired!", 400, "WALLET_TRANSACTION_EXPIRED")
    }

    const wallet = await Wallet.findOne({
        userId: userId,
        _id: transaction.walletId
    })

    if (!wallet) {
        throw new AppError("Wallet not found!", 404, "WALLET_NOT_FOUND")
    }

    const tmnCode = process.env.VNPAY_TMN_CODE
    const hashSecret = process.env.VNPAY_HASH_SECRET
    const apiUrl = process.env.VNPAY_URL
    const returnUrl = process.env.VNPAY_RETURN_URL

    if (!tmnCode || !hashSecret || !apiUrl || !returnUrl) {
        throw new AppError("VNPAY configuration is missing!", 500, "WALLET_VNPAY_CONFIGURATION_MISSING")
    }

    const createDate = getVnpayCreateDate()
    const expireDate = getVnpayExpireDate()

    const vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: String(transaction.amount * 100),
        vnp_CurrCode: "VND",
        vnp_TxnRef: transaction.transactionRef,
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

const handleVnpayReturn = async (query: Record<string, any>, userId: string) => {
    const hashSecret = process.env.VNPAY_HASH_SECRET

    if (!hashSecret) {
        throw new AppError("VNPAY configuration is missing!", 500, "WALLET_VNPAY_CONFIGURATION_MISSING")
    }

    const responseCode = query.vnp_ResponseCode
    const transactionRef = query.vnp_TxnRef
    const transactionNo = query.vnp_TransactionNo
    const isValid = verifySecureHash(query, hashSecret)

    if (!isValid) {
        throw new AppError("Invalid VNPAY signature!", 400, "WALLET_INVALID_VNPAY_SIGNATURE")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "WALLET_INVALID_USER_ID")
    }

    const wallet = await Wallet.findOne({ userId }).select("_id").lean()

    if (!wallet) {
        throw new AppError("Wallet not found!", 404, "WALLET_NOT_FOUND")
    }

    const transaction = await WalletTransaction.findOne({ transactionRef: transactionRef, walletId: wallet._id })

    if (!transaction) {
        throw new AppError("Transaction not found!", 404, "WALLET_TRANSACTION_NOT_FOUND")
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
        const session = await mongoose.startSession()
        let credited = false

        try {
            await session.withTransaction(async () => {
                const freshTransaction = await WalletTransaction
                    .findOne({ _id: transaction._id, status: "PENDING" })
                    .session(session)

                if (!freshTransaction) {
                    credited = false
                    return
                }

                const walletToCredit = await Wallet.findById(freshTransaction.walletId).session(session)

                if (!walletToCredit) {
                    throw new AppError("Wallet not found!", 404, "WALLET_NOT_FOUND")
                }

                const balanceBefore = walletToCredit.balance
                const balanceAfter = roundAmount(balanceBefore + freshTransaction.amount)

                walletToCredit.balance = balanceAfter
                await walletToCredit.save({ session })

                freshTransaction.status = "SUCCESS"
                freshTransaction.balanceBefore = balanceBefore
                freshTransaction.balanceAfter = balanceAfter
                freshTransaction.vnpTransactionNo = transactionNo
                await freshTransaction.save({ session })

                credited = true
            })
        }
        finally {
            await session.endSession()
        }

        if (!credited) {
            return {
                success: true,
                message: "Transaction already processed",
                code: "ALREADY_PROCESSED",
                transactionRef,
                amount: transaction.amount
            }
        }

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
        throw new AppError("Invalid ID format!", 400, "WALLET_INVALID_USER_ID")
    }

    const wallet = await Wallet
        .findOne({ userId })
        .select("_id")
        .lean()

    if (!wallet) {
        throw new AppError("Wallet not found!", 404, "WALLET_NOT_FOUND")
    }

    const transactions = await WalletTransaction
        .find({ walletId: wallet._id })
        .sort({ createdAt: -1 })
        .lean()

    return transactions
}

export { handleGetWallet, handleTopUpWallet, handleVnpayReturn, handleGetWalletTransactions, handleRetryTopUpWallet }