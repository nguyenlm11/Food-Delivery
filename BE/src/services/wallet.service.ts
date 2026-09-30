import mongoose from "mongoose"
import { AppError } from "../errors/error"
import Wallet from "../models/wallet.model"

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

export { handleGetWallet }