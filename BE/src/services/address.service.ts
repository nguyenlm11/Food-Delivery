import mongoose from "mongoose"
import Address from "../models/address.model"
import User from "../models/user.model"
import { AppError } from "../errors/AppError"
import { AddressCreateParams, AddressUpdateParams, AddressSearchQuery } from "../interfaces/address.interface"

const handleGetMyAddresses = async (userId: string, query: AddressSearchQuery) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "USER_INVALID_ID")
    }

    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const skip = (page - 1) * limit

    const [addresses, total] = await Promise.all([
        Address
            .find({ customerId: userId })
            .sort({ isDefault: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Address.countDocuments({ customerId: userId })
    ])

    return {
        addresses,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleCreateMyAddress = async (userId: string, params: AddressCreateParams) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "USER_INVALID_ID")
    }

    const { label, recipientName, recipientPhone, addressLine, longitude, latitude, isDefault } = params

    const user = await User.findById(userId)

    if (!user) {
        throw new AppError("User not found!", 404, "USER_NOT_FOUND")
    }

    if (label && !["HOME", "OFFICE"].includes(label)) {
        throw new AppError("Invalid address label!", 400, "ADDRESS_INVALID_LABEL")
    }

    const result = await Address.create({
        customerId: user._id,
        label: label || "HOME",
        recipientName: recipientName?.trim(),
        recipientPhone: recipientPhone?.trim(),
        addressLine: addressLine?.trim(),
        longitude: longitude,
        latitude: latitude,
        isDefault: false
    })

    return result
}

const handleUpdateMyAddress = async (userId: string, addressId: string, params: AddressUpdateParams) => {
    if (!mongoose.isValidObjectId(addressId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "ADDRESS_INVALID_ID")
    }

    const { label, recipientName, recipientPhone, addressLine, longitude, latitude } = params

    const address = await Address.findOne({
        _id: addressId,
        customerId: userId
    })

    if (!address) {
        throw new AppError("Address not found!", 404, "ADDRESS_NOT_FOUND")
    }

    if (label !== undefined) {
        if (!["HOME", "OFFICE"].includes(label)) {
            throw new AppError("Invalid address label!", 400, "ADDRESS_INVALID_LABEL")
        }
        address.label = label
    }

    if (recipientName !== undefined) {
        if (!recipientName.trim()) {
            throw new AppError("Invalid recipient name!", 400, "ADDRESS_INVALID_FIELD")
        }
        address.recipientName = recipientName.trim();
    }

    if (recipientPhone !== undefined) {
        if (!recipientPhone.trim()) {
            throw new AppError("Invalid recipient phone!", 400, "ADDRESS_INVALID_FIELD")
        }
        address.recipientPhone = recipientPhone.trim()
    }

    if (addressLine !== undefined) {
        if (!addressLine.trim()) {
            throw new AppError("Invalid address line!", 400, "ADDRESS_INVALID_FIELD")
        }
        address.addressLine = addressLine.trim()
    }

    if (longitude !== undefined || latitude !== undefined) {
        address.longitude = longitude
        address.latitude = latitude
    }

    await address.save()

    return address
}

const handleSetDefaultAddress = async (userId: string, addressId: string) => {
    if (!mongoose.isValidObjectId(addressId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "ADDRESS_INVALID_ID")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new AppError("User not found!", 404, "USER_NOT_FOUND")
    }

    const address = await Address.findOne({
        _id: addressId,
        customerId: user._id
    })

    if (!address) {
        throw new AppError("Address not found!", 404, "ADDRESS_NOT_FOUND")
    }

    await Address.updateMany(
        { customerId: user._id },
        { isDefault: false }
    )

    address.isDefault = true
    await address.save()
}

const handleDeleteMyAddress = async (userId: string, addressId: string) => {
    if (!mongoose.isValidObjectId(addressId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "ADDRESS_INVALID_ID")
    }

    const address = await Address.findOne({
        _id: addressId,
        customerId: userId
    })

    if (!address) {
        throw new AppError("Address not found!", 404, "ADDRESS_NOT_FOUND")
    }

    const isDefault = address.isDefault

    await address.deleteOne()

    if (isDefault) {
        const newDefaultAddress = await Address
            .findOne({ customerId: userId })
            .sort({ createdAt: -1 })

        if (newDefaultAddress) {
            await Address.updateMany(
                { customerId: userId },
                { isDefault: false }
            )

            newDefaultAddress.isDefault = true
            await newDefaultAddress.save()
        }
    }
}

export { handleGetMyAddresses, handleCreateMyAddress, handleUpdateMyAddress, handleSetDefaultAddress, handleDeleteMyAddress };
