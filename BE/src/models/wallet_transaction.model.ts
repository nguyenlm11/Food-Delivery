import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
    {
        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            required: true
        },
        type: {
            type: String,
            enum: ["TOPUP", "PAYMENT", "REFUND"],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        balanceBefore: {
            type: Number,
            required: true,
            min: 0
        },
        balanceAfter: {
            type: Number,
            required: true,
            min: 0
        },
        description: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true,
    }
)

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema)

export default WalletTransaction