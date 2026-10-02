import mongoose, { mongo } from "mongoose";

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
        vehicleRegistrationId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        licensePlate: { //biển số xe
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
        approvalStatus: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },
        rejectionReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

const Driver = mongoose.model("Driver", driverSchema)

export default Driver