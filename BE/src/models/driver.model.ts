import mongoose from "mongoose"

const driverSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        citizenId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        citizenImages: {
            front: { type: String, default: "" },
            back: { type: String, default: "" },
        },
        driverLicenseId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        vehicleModel: {
            type: String,
            required: true,
            trim: true
        },
        vehicleRegistrationId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        licensePlate: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        bankAccount: {
            bankName: { type: String, required: true },
            accountNumber: { type: String, required: true },
            accountHolder: { type: String, required: true }
        },
        status: {
            type: String,
            enum: ["OFFLINE", "ONLINE", "BUSY", "SUSPENDED"],
            default: "OFFLINE"
        },
        // % phí giao hàng Driver được nhận
        commissionRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 30
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalDeliveries: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
)

const Driver = mongoose.model("Driver", driverSchema)

const driverLocationSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
            unique: true
        },
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        accuracy: {
            type: Number,
            default: null
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

const DriverLocation = mongoose.model("DriverLocation", driverLocationSchema)

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

export { Driver, DriverLocation, DriverEarning }
