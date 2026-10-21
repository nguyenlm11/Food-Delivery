import mongoose from "mongoose";

const voucherUsageSchema = new mongoose.Schema(
    {
        voucherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        discountAmount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["RESERVED", "USED", "CANCELLED"],
            default: "RESERVED",
            required: true
        },
        usedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

const VoucherUsage = mongoose.model("VoucherUsage", voucherUsageSchema)

export default VoucherUsage