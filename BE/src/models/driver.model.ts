import mongoose from "mongoose";

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

export default Driver