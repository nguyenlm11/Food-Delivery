import mongoose from "mongoose"

const orderItemOptionSchema = new mongoose.Schema(
    {
        modifierOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ModifierOption",
            required: true
        },
        groupName: {
            type: String,
            required: true
        },
        optionName: {
            type: String,
            required: true
        },
        priceAdjustment: {
            type: Number,
            required: true
        }
    },
    { _id: false }
)

const orderItemSchema = new mongoose.Schema(
    {
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },
        // Snapshot tên/giá tại thời điểm đặt: món có thể bị sửa/xóa sau đó
        foodName: {
            type: String,
            required: true,
            trim: true
        },
        foodImage: {
            type: String,
            default: ""
        },
        menuName: {
            type: String,
            default: ""
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        options: {
            type: [orderItemOptionSchema],
            default: []
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
)

const orderAddressSchema = new mongoose.Schema(
    {
        recipientName: {
            type: String,
            default: ""
        },
        recipientPhone: {
            type: String,
            default: ""
        },
        addressLine: {
            type: String,
            required: true
        },
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        }
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        orderCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Owner",
            required: true
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            default: null
        },

        address: {
            type: orderAddressSchema,
            required: true
        },
        items: {
            type: [orderItemSchema],
            required: true
        },

        // Tiền
        foodAmount: {
            type: Number,
            required: true,
            min: 0
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        shipFee: {
            type: Number,
            default: 0,
            min: 0
        },
        tipAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        // Snapshot commissionRate của restaurant tại thời điểm đặt
        commissionRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        voucherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            default: null
        },
        voucherCode: {
            type: String,
            default: null
        },

        paymentMethod: {
            type: String,
            enum: ["WALLET", "CASH"],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING",
            required: true
        },

        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"],
            default: "PENDING",
            required: true
        },
        note: {
            type: String,
            trim: true,
            default: ""
        },
        cancelledReason: {
            type: String,
            trim: true,
            default: ""
        },
        deliveredAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

orderSchema.index({ customerId: 1, createdAt: -1 })
orderSchema.index({ restaurantId: 1, status: 1 })
orderSchema.index({ driverId: 1, status: 1 })

const Order = mongoose.model("Order", orderSchema)

export { Order }
