import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: String,
            default: null,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        birthday: {
            type: Date,
        },
        address: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            required: true,
            enum: ["ACTIVE", "INACTIVE", "PENDING", "BLOCKED", "DELETED"],
            trim: true,
            default: "PENDING"
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index(
    { phone: 1 },
    { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
)

const User = mongoose.model("User", userSchema)

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
        },
        attempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
)

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema)

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        revokedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)

export { User, OTP, RefreshToken }
