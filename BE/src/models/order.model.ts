import mongoose from "mongoose"

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
        addressLine: {
            type: String,
            required: true
        },
        recipientName: {
            type: String,
            default: ""
        },
        recipientPhone: {
            type: String,
            default: ""
        },
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
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
            enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
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

const orderItemSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },
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
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
)

orderItemSchema.index({ orderId: 1 })
orderItemSchema.index({ foodId: 1 })

const OrderItem = mongoose.model("OrderItem", orderItemSchema)

const orderItemOptionSchema = new mongoose.Schema(
    {
        orderItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true
        },
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
    {
        timestamps: true
    }
)

orderItemOptionSchema.index({ orderItemId: 1 })
orderItemOptionSchema.index({ orderItemId: 1, modifierOptionId: 1 }, { unique: true })

const OrderItemOption = mongoose.model("OrderItemOption", orderItemOptionSchema)

export { Order, OrderItem, OrderItemOption }
