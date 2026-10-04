import mongoose from "mongoose"
import { AppError } from "../errors/error"
import { DriverParams } from "../interfaces/interface"
import Driver from "../models/driver.model"
import User from "../models/user.model"
import { generatePassword, hashPassword } from "../utils/helper"
import { sendPasswordEmail } from "../configs/email"
import Role from "../models/role.model"

const handleCreateDriver = async (params: DriverParams) => {
    const { fullname, email, birthday, address, phone, citizenId, citizenImages, driverLicenseId, vehicleModel, vehicleRegistrationId, licensePlate, bankAccount } = params

    if (!fullname || !email || !birthday || !address || !phone || !citizenId || !driverLicenseId || !vehicleModel || !vehicleRegistrationId || !licensePlate || !bankAccount) {
        throw new AppError("Missing required fields!", 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError("Invalid email format!", 400)
    }

    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phone)) {
        throw new AppError("Invalid phone number format!", 400)
    }

    if (!/^\d{12}$/.test(citizenId)) {
        throw new AppError("Citizen ID must contain exactly 12 digits!", 400)
    }

    if (typeof bankAccount !== "object" || !bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountHolder) {
        throw new AppError("Invalid bank account details! Required: bankName, accountNumber, accountHolder", 400)
    }

    const [existEmail, existPhone, existCitizen, existDriverLicense, existVehicleRegistration, existLicensePlate, driverRole] = await Promise.all([
        User.findOne({ email: email.trim() }),
        User.findOne({ phone: phone.trim() }),
        Driver.findOne({ citizenId: citizenId.trim() }),
        Driver.findOne({ driverLicenseId: driverLicenseId.trim() }),
        Driver.findOne({ vehicleRegistrationId: vehicleRegistrationId.trim() }),
        Driver.findOne({ licensePlate: licensePlate.trim() }),
        Role.findOne({ name: "DRIVER" })
    ])

    if (existEmail) {
        throw new AppError("Email already exists!", 400)
    }

    if (existPhone) {
        throw new AppError("Phone number already exists!", 400)
    }

    if (existCitizen) {
        throw new AppError("Citizen ID already registered!", 400)
    }

    if (existDriverLicense) {
        throw new AppError("Driver license ID already registered!", 400)
    }

    if (existVehicleRegistration) {
        throw new AppError("Vehicle registration ID already registered!", 400)
    }

    if (existLicensePlate) {
        throw new AppError("License plate already registered!", 400)
    }

    if (!driverRole) {
        throw new AppError("Driver role not found in system!", 500)
    }

    const password = generatePassword()
    const hashedPassword = await hashPassword(password)
    const session = await mongoose.startSession()

    let createdUserId: mongoose.Types.ObjectId | null = null

    try {
        await session.withTransaction(async () => {
            const [newUser] = await User.create([{
                fullname: fullname.trim(),
                email: email.trim(),
                birthday: new Date(birthday),
                address: address.trim(),
                phone: phone.trim(),
                status: "ACTIVE",
                password: hashedPassword,
                roleId: driverRole._id
            }], { session })

            createdUserId = newUser._id

            await Driver.create([{
                userId: newUser._id,
                citizenId: citizenId.trim(),
                citizenImages: {
                    front: citizenImages?.front?.trim() || "",
                    back: citizenImages?.back?.trim() || ""
                },
                driverLicenseId: driverLicenseId.trim(),
                vehicleModel: vehicleModel.trim(),
                vehicleRegistrationId: vehicleRegistrationId.trim(),
                licensePlate: licensePlate.trim(),
                bankAccount: {
                    bankName: bankAccount.bankName.trim(),
                    accountNumber: bankAccount.accountNumber.trim(),
                    accountHolder: bankAccount.accountHolder.trim()
                },
            }], { session })
        })
    }
    finally {
        await session.endSession()
    }

    try {
        await sendPasswordEmail(email.trim(), password)
    }
    catch (error) {
        throw new AppError("Driver account was created, but failed to send login information to email!", 500)
    }

    const result = await Driver
        .findOne({ userId: createdUserId })
        .populate({
            path: "userId",
            select: "-password -__v"
        })
        .lean()

    return result
}

const handleGetAllDrivers = async () => {
    const drivers = await Driver
        .find()
        .populate("userId", "-password -__v")
        .lean()

    return drivers
}

export { handleGetAllDrivers, handleCreateDriver }