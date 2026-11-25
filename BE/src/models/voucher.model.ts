import mongoose from "mongoose"

const voucherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true
        },
        typeVoucher: {
            type: String,
            enum: ["SYSTEM", "RESTAURANT"],
            required: true
        },
        type: {
            type: String,
            enum: ["FOOD", "SHIP"],
            required: true
        },
        typeDiscount: {
            type: String,
            enum: ["AMOUNT", "PERCENT"],
            required: true
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        maxDiscount: {
            type: Number,
            min: 0,
            default: null
        },
        minPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: true
        },
        startTime: {
            type: String,
            required: true,
            default: "00:00",
            match: /^([01]\d|2[0-3]):[0-5]\d$/
        },
        endTime: {
            type: String,
            required: true,
            default: "23:59",
            match: /^([01]\d|2[0-3]):[0-5]\d$/
        },
        maxQuantity: {
            type: Number,
            min: 1,
            default: null
        },
        usedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "EXPIRED", "DELETED"],
            default: "ACTIVE",
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Voucher = mongoose.model("Voucher", voucherSchema)

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

export { Voucher, VoucherUsage }
