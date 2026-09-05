import mongoose from "mongoose";
import { generateOTP, hashPassword } from "../configs/utils";
import User from "../models/user.model"
import OTP from "../models/otp.model";
import { sendOTPEmail } from "../configs/email";
import { emit } from "node:cluster";

const handleRegister = async (fullname: string, email: string, birthday: string, address: string, phone: string, password: string, roleId: mongoose.Types.ObjectId) => {
    const user = await User.findOne({ email })
    if (user) {
        throw new Error("Email already exists");
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
        throw Error("User not found!")
    }

    if (user.status === "ACTIVE") {
        throw new Error("User is already verified!")
    }

    const ot = await OTP.findOne({ userId: user?._id, otp })

    if (!ot || ot.type !== "REGISTER") {
        throw Error("Invalid OTP!")
    }

    if (ot.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: ot._id })
        throw new Error("OTP expired!");
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { status: "ACTIVE" },
        { new: true, runValidators: true }
    );
    await OTP.deleteOne({ _id: ot._id })

    return updatedUser
}

export { handleRegister, handleVerifyOTP }