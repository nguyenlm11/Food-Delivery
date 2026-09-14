import mongoose from "mongoose"
import { AppError } from "../errors/error"
import Owner from "../models/owner.model"

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

export { handleGetAllOwner, handleGetOwnerById, handleGetMyOwner }