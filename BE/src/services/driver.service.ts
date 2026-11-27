import mongoose from "mongoose"
import { AppError } from "../errors/AppError"
import { CreateDriverBody, GetDriversQuery } from "../interfaces/driver.interface"
import { Driver, DriverLocation } from "../models/driver.model"
import { User } from "../models/user.model"
import { generatePassword, hashPassword } from "../utils/helper"
import { sendPasswordEmail } from "../configs/email"
import { Role } from "../models/role.model"
import { dateOnlyToDate, isValidDateOnly } from "../utils/date.util"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"

const handleCreateDriver = async (params: CreateDriverBody) => {
    const { fullname, email, birthday, address, phone, citizenId, citizenImages, driverLicenseId, vehicleModel, vehicleRegistrationId, licensePlate, bankAccount } = params

    if (!fullname || !email || !birthday || !address || !phone || !citizenId || !driverLicenseId || !vehicleModel || !vehicleRegistrationId || !licensePlate || !bankAccount) {
        throw new AppError("Missing required fields!", 400, "DRIVER_REQUIRED_FIELDS")
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError("Invalid email format!", 400, "DRIVER_INVALID_EMAIL")
    }

    if (!isValidDateOnly(birthday)) {
        throw new AppError("Invalid birthday format! Use YYYY-MM-DD.", 400, "DRIVER_INVALID_BIRTHDAY")
    }

    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phone)) {
        throw new AppError("Invalid phone number format!", 400, "DRIVER_INVALID_PHONE")
    }

    if (!/^\d{12}$/.test(citizenId)) {
        throw new AppError("Citizen ID must contain exactly 12 digits!", 400, "DRIVER_INVALID_CITIZEN_ID")
    }

    if (typeof bankAccount !== "object" || !bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountHolder) {
        throw new AppError("Invalid bank account details! Required: bankName, accountNumber, accountHolder", 400, "DRIVER_INVALID_BANK_ACCOUNT")
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
        throw new AppError("Email already exists!", 400, "DRIVER_EMAIL_ALREADY_EXISTS")
    }

    if (existPhone) {
        throw new AppError("Phone number already exists!", 400, "DRIVER_PHONE_ALREADY_EXISTS")
    }

    if (existCitizen) {
        throw new AppError("Citizen ID already registered!", 400, "DRIVER_CITIZEN_ID_ALREADY_EXISTS")
    }

    if (existDriverLicense) {
        throw new AppError("Driver license ID already registered!", 400, "DRIVER_LICENSE_ALREADY_EXISTS")
    }

    if (existVehicleRegistration) {
        throw new AppError("Vehicle registration ID already registered!", 400, "DRIVER_VEHICLE_REGISTRATION_ALREADY_EXISTS")
    }

    if (existLicensePlate) {
        throw new AppError("License plate already registered!", 400, "DRIVER_LICENSE_PLATE_ALREADY_EXISTS")
    }

    if (!driverRole) {
        throw new AppError("Driver role not found in system!", 500, "DRIVER_ROLE_NOT_FOUND")
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
                birthday: dateOnlyToDate(birthday),
                address: address.trim(),
                phone: phone.trim(),
                status: "ACTIVE",
                password: hashedPassword,
                roleId: driverRole._id
            }], { session })

            createdUserId = newUser._id

            const [driver] = await Driver.create([{
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
                presenceStatus: "OFFLINE",
                lastActiveAt: null,
                workStatus: "IDLE",
                currentOrderId: null
            }], { session })

            await DriverLocation.create([{
                driverId: driver._id,
                longitude: 0,
                latitude: 0
            }], { session })
        })
    }
    finally {
        await session.endSession()
    }

    let emailSent = true

    try {
        await sendPasswordEmail(email.trim(), password)
    }
    catch (emailError) {
        emailSent = false
        console.error("Failed to send driver login email:", emailError)
    }

    const result = await Driver
        .findOne({ userId: createdUserId })
        .populate({
            path: "userId",
            select: "-password -__v"
        })
        .lean()

    return { ...result, emailSent }
}

const handleGetDriverById = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "DRIVER_INVALID_ID")
    }

    const driver = await Driver
        .findById(id)
        .populate({
            path: "userId",
            select: "-password -__v",
            populate: {
                path: "roleId",
                select: "name"
            }
        })
        .lean()

    if (!driver) {
        throw new AppError("Driver not found!", 404, "DRIVER_NOT_FOUND")
    }

    return driver
}

const handleGetAllDrivers = async (query: GetDriversQuery) => {
    const search = query.search?.trim()
    const status = query.status
    const presenceStatus = query.presenceStatus
    const workStatus = query.workStatus
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = resolveSortField(query.sortBy, ["fullname", "createdAt", "updatedAt", "presenceStatus", "workStatus", "rating"], "createdAt")
    const sortOrder = resolveSortOrder(query.sortOrder)
    const skip = (page - 1) * limit

    const mongoQuery: Record<string, any> = {}

    if (presenceStatus) {
        mongoQuery.presenceStatus = presenceStatus
    }

    if (workStatus) {
        mongoQuery.workStatus = workStatus
    }

    if (search) {
        const userRegex = { $regex: search, $options: "i" }

        const matchedUsers = await User.find({
            $or: [
                { fullname: userRegex },
                { email: userRegex },
                { phone: userRegex }
            ]
        }).select("_id").lean()

        mongoQuery.$or = [
            { citizenId: userRegex },
            { driverLicenseId: userRegex },
            { vehicleRegistrationId: userRegex },
            { licensePlate: userRegex },
            { userId: { $in: matchedUsers.map(user => user._id) } }
        ]
    }

    const userFilter: Record<string, any> = status ? { status } : { status: { $ne: "DELETED" } }

    if (sortBy === "fullname") {
        const sortedUsers = await User
            .find(userFilter)
            .select("_id")
            .sort({ fullname: sortOrder })
            .lean()

        const sortedUserIds = sortedUsers.map(user => user._id)

        mongoQuery.userId = { $in: sortedUserIds }

        const [drivers, total] = await Promise.all([
            Driver.find(mongoQuery)
                .populate("userId", "-password -__v")
                .select("-__v")
                .lean(),
            Driver.countDocuments(mongoQuery)
        ])

        const driversByUserId = new Map(drivers.map(driver => [driver.userId._id.toString(), driver]))

        const sortedDrivers = sortedUserIds
            .map(userId => driversByUserId.get(userId.toString()))
            .filter(driver => driver !== undefined)

        const pageDrivers = sortedDrivers.slice(skip, skip + limit)

        return {
            drivers: pageDrivers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    const userIds = await User.find(userFilter).lean()

    mongoQuery.userId = { $in: userIds.map(user => user._id) }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [drivers, total] = await Promise.all([
        Driver.find(mongoQuery)
            .populate("userId", "-password -__v")
            .select("-__v")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Driver.countDocuments(mongoQuery)
    ])

    return {
        drivers: drivers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export { handleGetAllDrivers, handleGetDriverById, handleCreateDriver }