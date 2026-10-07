import mongoose from "mongoose"

const driverEarningSchema = new mongoose.Schema(
    {
        // Đơn hàng
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true
        },

        // Driver thực hiện đơn
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },

        // Phí giao hàng khách trả
        deliveryFee: {
            type: Number,
            required: true,
            min: 0
        },

        // Snapshot commissionRate của Driver
        // tại thời điểm Order được hoàn thành
        commissionRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        // Tiền Driver nhận từ delivery fee
        baseEarning: {
            type: Number,
            required: true,
            min: 0
        },

        // Tiền thưởng thêm
        bonusAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        // Tiền tip khách trả cho Driver
        tipAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        // Tổng thu nhập Driver
        totalEarning: {
            type: Number,
            required: true,
            min: 0
        },

        // Phần Platform giữ lại từ delivery fee
        platformAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Trạng thái thu nhập
        earningStatus: {
            type: String,
            enum: [
                "PENDING",
                "COMPLETED",
                "CANCELLED",
                "REFUNDED"
            ],
            default: "PENDING"
        },
    },
    {
        timestamps: true
    }
)

const DriverEarning = mongoose.model("DriverEarning", driverEarningSchema)

export default DriverEarning