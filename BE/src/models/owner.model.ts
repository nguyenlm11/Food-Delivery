import mongoose, { mongo } from "mongoose";

const ownerSchema = new mongoose.Schema(
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
        taxCode: {
            type: String,
            trim: true,
            default: ""
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

const Owner = mongoose.model("Owner", ownerSchema)

export default Owner