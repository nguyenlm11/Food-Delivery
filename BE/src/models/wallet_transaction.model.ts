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
            min: 0,
            default: null
        },
        balanceAfter: {
            type: Number,
            min: 0,
            default: null
        },
        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING",
            required: true
        },
        transactionRef: {
            type: String,
            required: true,
            unique: true
        },
        vnpTransactionNo: {
            type: String,
            default: null
        },

        description: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema)

export default WalletTransaction