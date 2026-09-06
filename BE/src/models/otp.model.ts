import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        otp: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["REGISTER", "RESET_PASSWORD", "DELETE_ACCOUNT"]
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
    }
)

const OTP = mongoose.model("OTP", otpSchema)

export default OTP