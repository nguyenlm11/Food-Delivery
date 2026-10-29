import User from '../models/user.model'
import Address from "../models/address.model"
import Role from "../models/role.model"
import OTP from "../models/otp.model"
import mongoose from "mongoose"
import { AppError } from "../errors/AppError"
import { CustomerSearchQuery, CustomerUpdateParams } from "../interfaces/customer.interface"

const handleGetAllCustomers = async (query: CustomerSearchQuery) => {
    const search = query.search?.trim()
    const status = query.status
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? 1 : -1
    const skip = (page - 1) * limit

    const mongoQuery: Record<string, any> = {}

    if (search) {
        const matchingAddresses = await Address.find({
            $or: [
                { label: { $regex: search, $options: "i" } },
                { recipientName: { $regex: search, $options: "i" } },
                { recipientPhone: { $regex: search, $options: "i" } },
                { addressLine: { $regex: search, $options: "i" } },
            ]
        }).select("customerId").lean()

        const customerIds = [
            ...new Set(
                matchingAddresses.map(address =>
                    address.customerId.toString()
                )
            )
        ]

        mongoQuery.$or = [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { _id: { $in: customerIds } }
        ]
    }

    if (status) { mongoQuery.status = status }

    const customerRole = await Role.findOne({ name: "CUSTOMER" })

    if (!customerRole) { throw new AppError("CUSTOMER role not found!", 404, "CUSTOMER_ROLE_NOT_FOUND") }

    mongoQuery.roleId = customerRole._id

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [customers, total] = await Promise.all([
        User
            .find(mongoQuery)
            .populate("roleId", "name")
            .select("-password")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(mongoQuery)
    ])

    return {
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleGetCustomerById = async (customerId: string) => {
    if (!mongoose.isValidObjectId(customerId)) {
        throw new AppError("Invalid ID format!", 400, "CUSTOMER_INVALID_ID")
    }

    const customerRole = await Role.findOne({ name: "CUSTOMER" })

    if (!customerRole) {
        throw new AppError("Customer role not found!", 500, "CUSTOMER_ROLE_NOT_FOUND")
    }

    const customer = await User
        .findOne({
            _id: customerId,
            roleId: customerRole._id
        })
        .populate("roleId", "name")
        .select("-password")
        .lean()

    if (!customer) {
        throw new AppError("Customer not found!", 404, "CUSTOMER_NOT_FOUND")
    }

    return customer
}

const handleUpdateMyCustomer = async (id: string, params: CustomerUpdateParams) => {
    const { fullname, birthday, phone } = params

    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "CUSTOMER_INVALID_ID")
    }

    if (phone !== undefined) {
        if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone)) {
            throw new AppError("Invalid phone number format!", 400, "CUSTOMER_INVALID_PHONE")
        }

        const existPhone = await User.findOne({
            phone,
            _id: { $ne: id }
        })

        if (existPhone) {
            throw new AppError("Phone number already exists!", 400, "CUSTOMER_PHONE_ALREADY_EXISTS")
        }
    }

    if (birthday !== undefined && birthday !== null && isNaN(Date.parse(birthday))) {
        throw new AppError("Invalid birthday format!", 400, "CUSTOMER_INVALID_BIRTHDAY")
    }

    const customerData: Record<string, any> = {}
    if (fullname !== undefined) customerData.fullname = fullname
    if (birthday !== undefined) customerData.birthday = birthday ? new Date(birthday) : null
    if (phone !== undefined) customerData.phone = phone

    const updatedCustomer = await User.findByIdAndUpdate(
        id,
        { $set: customerData },
        { returnDocument: "after", runValidators: true }
    )
        .select("-password -__v")
        .populate("roleId", "name")
        .lean()

    if (!updatedCustomer) {
        throw new AppError("User not found!", 404, "CUSTOMER_NOT_FOUND")
    }

    return updatedCustomer
}

const handleDeleteCustomerById = async (customerId: string) => {
    if (!mongoose.isValidObjectId(customerId)) {
        throw new AppError("Invalid ID format!", 400, "CUSTOMER_INVALID_ID")
    }

    const customerRole = await Role.findOne({ name: "CUSTOMER" })

    if (!customerRole) {
        throw new AppError("Customer role not found!", 500, "CUSTOMER_ROLE_NOT_FOUND")
    }

    const customer = await User.findOne({
        _id: customerId,
        roleId: customerRole._id
    })

    if (!customer) {
        throw new AppError("Customer not found!", 404, "CUSTOMER_NOT_FOUND")
    }

    if (customer.status === "DELETED") {
        throw new AppError("Customer has already been deleted!", 400, "CUSTOMER_ALREADY_DELETED")
    }

    customer.status = "DELETED"
    await customer.save()
    await OTP.deleteMany({ userId: customer._id })
}

export { handleGetAllCustomers, handleGetCustomerById, handleUpdateMyCustomer, handleDeleteCustomerById }
