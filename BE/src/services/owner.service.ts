import mongoose from "mongoose"
import { AppError } from "../errors/error"
import Owner from "../models/owner.model"
import { OwnerUpdateParams } from "../interfaces/interface"
import User from "../models/user.model"

const handleGetAllOwner = async () => {
    const owner = await Owner
        .find()
        .populate("userId", "-password -__v")
        .lean()

    return owner
}

const handleGetOwnerById = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid Owner ID format!", 400)
    }

    const owner = await Owner
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

    if (!owner) {
        throw new AppError("Owner not found!", 404)
    }

    return owner
}

const handleGetMyOwner = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid Owner ID format!", 400)
    }

    const owner = await Owner
        .findOne({ userId: id })
        .populate({
            path: "userId",
            select: "-password -__v",
            populate: {
                path: "roleId",
                select: "name"
            }
        })
        .lean()

    if (!owner) {
        throw new AppError("Owner not found!", 404)
    }

    return owner
}

const handleUpdateMyOwner = async (id: string, params: OwnerUpdateParams) => {
    const { fullname, birthday, address, phone, taxCode, bankAccount } = params

    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid User ID format!", 400)
    }

    if (taxCode !== undefined && !/^\d{10}(-\d{3})?$/.test(taxCode)) {
        throw new AppError("Invalid tax code! Must be 10 or 13 digits (format: XXXXXXXXXX-XXX)", 400)
    }

    if (phone !== undefined) {
        if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone)) {
            throw new AppError("Invalid phone number format!", 400)
        }

        const existPhone = await User.findOne({
            phone,
            _id: { $ne: id }
        })

        if (existPhone) {
            throw new AppError("Phone number already exists!", 400)
        }
    }

    if (birthday !== undefined && birthday !== null && isNaN(Date.parse(birthday))) {
        throw new AppError("Invalid birthday format!", 400)
    }

    const owner = await Owner.findOne({ userId: id })

    if (!owner) {
        throw new AppError("User not found!", 404)
    }

    const userData: Record<string, any> = {}
    if (fullname !== undefined) userData.fullname = fullname
    if (birthday !== undefined) userData.birthday = birthday ? new Date(birthday) : null
    if (address !== undefined) userData.address = address
    if (phone !== undefined) userData.phone = phone

    const ownerData: Record<string, any> = {}
    if (taxCode !== undefined) ownerData.taxCode = taxCode
    if (bankAccount !== undefined) ownerData.bankAccount = bankAccount
    ownerData.approvalStatus = "PENDING"

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            if (Object.keys(userData).length > 0) {
                await User.updateOne({ _id: id }, { $set: userData }, { session })
            }

            if (Object.keys(ownerData).length > 0) {
                await Owner.updateOne({ userId: id }, { $set: ownerData }, { session })
            }
        })
    }
    finally {
        await session.endSession()
    }
    return { ...params }
}

const handleApproveOwner = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid Owner ID format!", 400)
    }

    const owner = await Owner.findById(id)

    if (!owner) {
        throw new AppError("Owner not found!", 404)
    }

    if (owner.approvalStatus !== "PENDING") {
        throw new AppError(`Owner has already been ${owner.approvalStatus.toLowerCase()}!`, 400)
    }

    owner.approvalStatus = "APPROVED"
    // owner.rejectionReason = ""

    await owner.save()

}

const handleRejectOwner = async (id: string, rejectionReason: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid Owner ID format!", 400)
    }

    const owner = await Owner.findById(id)

    if (!owner) {
        throw new AppError("Owner not found!", 404)
    }

    if (owner.approvalStatus !== "PENDING") {
        throw new AppError(`Owner has already been ${owner.approvalStatus.toLowerCase()}!`, 400)
    }

    if (!rejectionReason || rejectionReason.trim() === "") {
        throw new AppError("Rejection reason is required!", 400)
    }

    owner.approvalStatus = "REJECTED"
    owner.rejectionReason = rejectionReason.trim()

    await owner.save()

}
export { handleGetAllOwner, handleGetOwnerById, handleGetMyOwner, handleUpdateMyOwner, handleApproveOwner, handleRejectOwner }