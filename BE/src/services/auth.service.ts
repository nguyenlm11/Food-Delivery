import mongoose from "mongoose";
import { generateOTP, hashPassword } from "../utils/helper";
import User from "../models/user.model"
import OTP from "../models/otp.model";
import { sendOTPEmail } from "../configs/email";
import { AppError } from "../errors/error";
import Role from "../models/role.model";

const handleRegister = async (fullname: string, email: string, birthday: string, address: string, phone: string, password: string, roleId: mongoose.Types.ObjectId) => {
    const user = await User.findOne({ email })
    const role = await Role.findById(roleId)

    if (user) {
        throw new AppError("Email already exists!", 400);
    }

    if (!role) {
        throw new AppError("Role doesn't exist!", 400);
    }

    const hashPass = await hashPassword(password)
    const data = await User.create({
        fullname: fullname,
        email: email,
        birthday: new Date(birthday),
        address: address,
        phone: phone,
        status: "PENDING",
        password: hashPass,
        roleId: roleId
    })

    const otp = generateOTP()
    const expAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.create({
        userId: data._id,
        otp: otp,
        type: "REGISTER",
        expiresAt: expAt
    })

    await sendOTPEmail(data.email, otp)

    const u = await User
        .findById(data._id)
        .select("-password")
        .populate("roleId", "name")
        .lean()

    return u;
}

const handleVerifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status === "ACTIVE") {
        throw new AppError("User is already verified!", 400)
    }

    const ot = await OTP.findOne({ userId: user?._id, otp })

    if (!ot || ot.type !== "REGISTER") {
        throw new AppError("Invalid OTP!", 400)
    }

    if (ot.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: ot._id })
        throw new AppError("OTP expired!", 400);
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { status: "ACTIVE" },
        { returnDocument: 'after', runValidators: true }
    )
    await OTP.deleteOne({ _id: ot._id })

    return updatedUser
}

const handleResendOTP = async (email: string) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status !== "PENDING") {
        throw new AppError("Account is already verified or invalid!", 400)
    }

    const recentOTP = await OTP.findOne({ userId: user._id, type: "REGISTER" }).sort({ createdAt: -1 })
    if (recentOTP) {
        const timeDiffInSeconds = (Date.now() - new Date(recentOTP.createdAt).getTime()) / 1000;
        if (timeDiffInSeconds < 60) {
            const waitTime = Math.ceil(60 - timeDiffInSeconds);
            throw new AppError(`Please wait ${waitTime} seconds before requesting a new OTP!`, 429);
        }
    }

    await OTP.deleteMany({ userId: user._id })

    const otp = generateOTP()
    const expAt = new Date(Date.now() + 5 * 60 * 1000);
    const result = await OTP.create({
        userId: user._id,
        otp: otp,
        type: "REGISTER",
        expiresAt: expAt
    })

    await sendOTPEmail(email, otp)

    return result
}

export { handleRegister, handleVerifyOTP, handleResendOTP }