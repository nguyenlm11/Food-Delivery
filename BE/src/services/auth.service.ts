import mongoose from "mongoose";
import { comparePassword, generateOTP, hashPassword } from "../utils/helper";
import User from "../models/user.model";
import OTP from "../models/otp.model";
import Role from "../models/role.model";
import { sendOTPEmail } from "../configs/email";
import { AppError } from "../errors/error";
import jwt from 'jsonwebtoken';

const handleLogin = async (email: string, password: string) => {
    const user = await User
        .findOne({ email })
        .populate("roleId", "name")

    if (!user || !await comparePassword(password, user.password)) {
        throw new AppError("Email or password incorrect!", 400);
    }

    if (user.status === "PENDING") {
        throw new AppError("Please verify your email address first!", 400)
    }

    if (user.status !== "ACTIVE") {
        throw new AppError("The account doesn't have permission to log in!", 403)
    }

    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: (user.roleId as any)?.name
    }

    const accessSecret = process.env.JWT_ACCESS_SECRET!
    const refreshSecret = process.env.JWT_REFRESH_SECRET!

    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any })
    const refreshToken = jwt.sign({ id: user._id }, refreshSecret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any })

    return { accessToken, refreshToken }
}

const handleRefreshToken = async (refreshToken: string) => {
    let decoded: any
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)
    } catch (error) {
        throw new AppError("Refresh token is invalid or expired. Please login again!", 401)
    }
    // console.log(decoded)

    const user = await User
        .findById(decoded.id)
        .populate("roleId", "name")

    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status !== "ACTIVE") {
        throw new AppError("The account doesn't have permission to perform this action!", 403)
    }

    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: (user.roleId as any)?.name
    }

    const accessSecret = process.env.JWT_ACCESS_SECRET!
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any })

    return accessToken;
}

const handleCustomerRegister = async (fullname: string, email: string, birthday: string, address: string, phone: string, password: string) => {
    const user = await User.findOne({ email })
    if (user) {
        throw new AppError("Email already exists!", 400);
    }

    const customerRole = await Role.findOne({ name: "CUSTOMER" })
    if (!customerRole) {
        throw new AppError("Customer role not found!", 400);
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
        roleId: customerRole._id
    })

    const otp = generateOTP()
    const expAt = new Date(Date.now() + 5 * 60 * 1000)

    await OTP.create({
        userId: data._id,
        otp: otp,
        type: "REGISTER",
        expiresAt: expAt
    })

    await sendOTPEmail(data.email, otp)

    const result = await User
        .findById(data._id)
        .select("-password")
        .populate("roleId", "name")
        .lean()

    return result
}

const handleVerifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status !== "PENDING") {
        throw new AppError("Account is already verified or blocked!", 400)
    }

    const ot = await OTP.findOne({ userId: user._id, type: "REGISTER" })

    if (!ot || ot.otp !== otp) {
        throw new AppError("Invalid OTP!", 400)
    }

    if (ot.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: ot._id });
        throw new AppError("OTP expired!", 400)
    }

    user.status = "ACTIVE"
    await user.save()

    await OTP.deleteOne({ _id: ot._id })
}

const handleResendOTP = async (email: string) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status !== "PENDING") {
        throw new AppError("Account is already verified or blocked!", 400)
    }

    const recentOTP = await OTP.findOne({ userId: user._id, type: "REGISTER" }).sort({ createdAt: -1 })
    if (recentOTP) {
        const timeDiffInSeconds = (Date.now() - new Date(recentOTP.createdAt).getTime()) / 1000;
        if (timeDiffInSeconds < 60) {
            const waitTime = Math.ceil(60 - timeDiffInSeconds);
            throw new AppError(`Please wait ${waitTime} seconds before requesting a new OTP!`, 429);
        }
    }

    await OTP.deleteMany({ userId: user._id, type: "REGISTER" })

    const otp = generateOTP()
    const expAt = new Date(Date.now() + 5 * 60 * 1000)
    await OTP.create({
        userId: user._id,
        otp: otp,
        type: "REGISTER",
        expiresAt: expAt
    })

    await sendOTPEmail(email, otp)
}

const handleForgetPassword = async (email: string) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status !== "ACTIVE") {
        throw new AppError("Account is not active or has been blocked!", 400);
    }

    const recentOTP = await OTP.findOne({ userId: user._id, type: "RESET_PASSWORD" }).sort({ createdAt: -1 })
    if (recentOTP) {
        const timeDiffInSeconds = (Date.now() - new Date(recentOTP.createdAt).getTime()) / 1000;
        if (timeDiffInSeconds < 60) {
            const waitTime = Math.ceil(60 - timeDiffInSeconds);
            throw new AppError(`Please wait ${waitTime} seconds before requesting a new OTP!`, 429);
        }
    }

    await OTP.deleteMany({
        userId: user._id,
        type: "RESET_PASSWORD"
    })

    const otp = generateOTP()
    const expAt = new Date(Date.now() + 5 * 60 * 1000)
    await OTP.create({
        userId: user._id,
        otp: otp,
        type: "RESET_PASSWORD",
        expiresAt: expAt
    })

    await sendOTPEmail(email, otp)
}

const handleResetPassword = async (email: string, otp: string, password: string) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status !== "ACTIVE") {
        throw new AppError("Account is not active or has been blocked!", 400);
    }

    const myOTP = await OTP.findOne({
        userId: user._id,
        type: "RESET_PASSWORD"
    })

    if (!myOTP || myOTP.otp !== otp) {
        throw new AppError("Invalid OTP!", 400)
    }

    if (myOTP.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: myOTP._id })
        throw new AppError("OTP expired!", 400)
    }

    user.password = await hashPassword(password)
    await user.save()

    await OTP.deleteOne({ _id: myOTP._id })
}

const handleChangePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new AppError("User not found!", 404)
    }

    if (user.status === "BLOCKED" || user.status === "INACTIVE") {
        throw new AppError("Account is inactive or blocked!", 400)
    }

    if (oldPassword === newPassword) {
        throw new AppError("New password must be different from old password!", 400)
    }

    if (newPassword.length < 6) {
        throw new AppError("Password must contain at least 6 characters!", 400)
    }

    const comparePass = await comparePassword(oldPassword, user?.password)

    if (!comparePass) {
        throw new AppError("Old password is incorrect!", 400)
    }

    user.password = await hashPassword(newPassword)
    await user.save()
}

const handleLogout = async (userId: string) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new AppError("User not found!", 404)
    }
    return true
}

export { handleLogin, handleRefreshToken, handleCustomerRegister, handleVerifyOTP, handleResendOTP, handleForgetPassword, handleResetPassword, handleChangePassword, handleLogout }