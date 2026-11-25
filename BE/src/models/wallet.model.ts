import mongoose from "mongoose"

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        balance: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true,
    }
)

const Wallet = mongoose.model("Wallet", walletSchema)

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

export { Wallet, WalletTransaction }
