import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
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
            required: true,
            unique: true,
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

const User = mongoose.model("User", userSchema)

export default User
