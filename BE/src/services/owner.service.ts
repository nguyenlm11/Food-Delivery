import mongoose from "mongoose"
import { AppError } from "../errors/AppError"
import Owner from "../models/owner.model"
import { CitizenUpdateParams, OwnerSearchQuery, OwnerUpdateParams } from "../interfaces/owner.interface"
import User from "../models/user.model"

const handleGetAllOwner = async (query: OwnerSearchQuery) => {
    const search = query.search?.trim()
    const approvalStatus = query.approvalStatus
    const status = query.status
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = query.sortBy || "approvalStatus"
    const sortOrder = query.sortOrder === "asc" ? 1 : -1
    const skip = (page - 1) * limit

    const mongoQuery: Record<string, any> = {}

    const ownerSearch: Record<string, any>[] = []
    let searchUserIds: mongoose.Types.ObjectId[] = []

    if (search) {
        const users = await User.find({
            $or: [
                { fullname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },

            ]
        })
            .select("_id")
            .lean()

        searchUserIds = users.map(user => user._id)

        ownerSearch.push(
            { citizenId: { $regex: search, $options: "i" } },
            { taxCode: { $regex: search, $options: "i" } }
        )

        if (searchUserIds.length > 0) {
            ownerSearch.push({ userId: { $in: searchUserIds } })
        }

        mongoQuery.$or = ownerSearch
    }

    if (approvalStatus) {
        mongoQuery.approvalStatus = approvalStatus as "PENDING" | "APPROVED" | "REJECTED"
    }

    if (status) {
        const users = await User
            .find({ status: status as "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED" | "DELETED" })
            .select("_id")
            .lean()
        mongoQuery.userId = { $in: users.map(user => user._id) }
    }
    else {
        const users = await User
            .find({ status: { $ne: "DELETED" } })
            .select("_id")
            .lean()
        mongoQuery.userId = { $in: users.map(user => user._id) }
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [owners, total] = await Promise.all([
        Owner.find(mongoQuery)
            .populate("userId", "-password -__v")
            .select("-__v")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        Owner.countDocuments(mongoQuery)
    ])

    return {
        owners: owners,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}


const handleGetOwnerById = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "OWNER_INVALID_ID")
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
        throw new AppError("Owner not found!", 404, "OWNER_NOT_FOUND")
    }

    return owner
}

const handleGetMyOwner = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "OWNER_INVALID_USER_ID")
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
        throw new AppError("Owner not found!", 404, "OWNER_NOT_FOUND")
    }

    return owner
}

const handleUpdateMyOwner = async (id: string, params: OwnerUpdateParams) => {
    const { fullname, birthday, address, phone, taxCode, bankAccount } = params

    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "OWNER_INVALID_USER_ID")
    }

    if (taxCode !== undefined && !/^\d{10}(-\d{3})?$/.test(taxCode)) {
        throw new AppError("Invalid tax code! Must be 10 or 13 digits (format: XXXXXXXXXX-XXX)", 400, "OWNER_INVALID_TAX_CODE")
    }

    if (phone !== undefined) {
        if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone)) {
            throw new AppError("Invalid phone number format!", 400, "OWNER_INVALID_PHONE")
        }

        const existPhone = await User.findOne({
            phone,
            _id: { $ne: id }
        })

        if (existPhone) {
            throw new AppError("Phone number already exists!", 400, "OWNER_PHONE_ALREADY_EXISTS")
        }
    }

    if (birthday !== undefined && birthday !== null && isNaN(Date.parse(birthday))) {
        throw new AppError("Invalid birthday format!", 400, "OWNER_INVALID_BIRTHDAY")
    }

    const owner = await Owner.findOne({ userId: id })

    if (!owner) {
        throw new AppError("User not found!", 404, "OWNER_USER_NOT_FOUND")
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
    return {
        ...params,
        ownerId: owner._id,
        userId: id,
        approvalStatus: ownerData.approvalStatus
    }
}

const handleApproveOwner = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "OWNER_INVALID_ID")
    }

    const owner = await Owner.findById(id)

    if (!owner) {
        throw new AppError("Owner not found!", 404, "OWNER_NOT_FOUND")
    }

    if (owner.approvalStatus !== "PENDING") {
        throw new AppError(`Owner has already been ${owner.approvalStatus.toLowerCase()}!`, 400, "OWNER_APPROVAL_ALREADY_PROCESSED")
    }

    owner.approvalStatus = "APPROVED"

    await owner.save()

    return owner
}

const handleRejectOwner = async (id: string, rejectionReason: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid Owner ID format!", 400, "OWNER_INVALID_ID")
    }

    const owner = await Owner.findById(id)

    if (!owner) {
        throw new AppError("Owner not found!", 404, "OWNER_NOT_FOUND")
    }

    if (owner.approvalStatus !== "PENDING") {
        throw new AppError(`Owner has already been ${owner.approvalStatus.toLowerCase()}!`, 400, "OWNER_APPROVAL_ALREADY_PROCESSED")
    }

    if (rejectionReason.trim() === "") {
        throw new AppError("Rejection reason is required!", 400, "OWNER_REJECTION_REASON_REQUIRED")
    }

    owner.approvalStatus = "REJECTED"
    owner.rejectionReason = rejectionReason.trim()

    await owner.save()

    return owner
}

const handleResubmitApproval = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "OWNER_INVALID_USER_ID")
    }

    const owner = await Owner.findOne({ userId: id })

    if (!owner) {
        throw new AppError("Owner not found!", 404, "OWNER_NOT_FOUND")
    }

    if (owner.approvalStatus !== "REJECTED") {
        throw new AppError(`Owner has already been ${owner.approvalStatus.toLowerCase()}!`, 400, "OWNER_APPROVAL_NOT_REJECTED")
    }

    owner.approvalStatus = "PENDING"
    owner.rejectionReason = ""

    await owner.save()

    return {
        ownerId: owner._id,
        userId: id,
        approvalStatus: owner.approvalStatus
    }
}

const handleUpdateCitizen = async (userId: string, params: CitizenUpdateParams) => {
    const { citizenId, citizenImages } = params

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "OWNER_INVALID_USER_ID")
    }

    if (!citizenId || !/^\d{12}$/.test(citizenId)) {
        throw new AppError("Invalid citizen ID! Citizen ID must contain exactly 12 digits.", 400, "OWNER_INVALID_CITIZEN_ID")
    }

    if (!citizenImages) {
        throw new AppError("Citizen images are required!", 400, "OWNER_CITIZEN_IMAGES_REQUIRED")
    }

    if (!citizenImages.front || !citizenImages.back) {
        throw new AppError("Both front and back citizen images are required!", 400, "OWNER_CITIZEN_IMAGES_REQUIRED")
    }

    const owner = await Owner.findOne({ userId })

    if (!owner) {
        throw new AppError("Owner not found!", 404, "OWNER_NOT_FOUND")
    }

    owner.citizenId = citizenId

    owner.citizenImages = {
        front: citizenImages.front,
        back: citizenImages.back
    }

    owner.approvalStatus = "PENDING"

    await owner.save()

    return {
        citizenId: owner.citizenId,
        citizenImages: owner.citizenImages,
        approvalStatus: owner.approvalStatus,
        ownerId: owner._id,
        userId
    }
}


export { handleGetAllOwner, handleGetOwnerById, handleGetMyOwner, handleUpdateMyOwner, handleApproveOwner, handleRejectOwner, handleResubmitApproval, handleUpdateCitizen }