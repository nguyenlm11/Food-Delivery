import { User } from '../models/user.model'
import { Address } from "../models/address.model"
import { Role } from "../models/role.model"
import mongoose from "mongoose"
import { AppError } from "../errors/AppError"
import { GetCustomersQuery, UpdateCustomerBody } from "../interfaces/customer.interface"
import { dateOnlyToDate, isValidDateOnly } from "../utils/date.util"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"

const handleGetAllCustomers = async (query: GetCustomersQuery) => {
    const search = query.search?.trim()
    const status = query.status
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = resolveSortField(query.sortBy, ["createdAt", "updatedAt", "fullname", "email", "status"], "createdAt")
    const sortOrder = resolveSortOrder(query.sortOrder)
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
    else { mongoQuery.status = { $ne: "DELETED" } }

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

const handleUpdateMyCustomer = async (id: string, params: UpdateCustomerBody) => {
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

    if (birthday !== undefined && birthday !== null && !isValidDateOnly(birthday)) {
        throw new AppError("Invalid birthday format! Use YYYY-MM-DD.", 400, "CUSTOMER_INVALID_BIRTHDAY")
    }

    const customerData: Record<string, any> = {}
    if (fullname !== undefined) customerData.fullname = fullname
    if (birthday !== undefined) customerData.birthday = birthday ? dateOnlyToDate(birthday) : null
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

export { handleGetAllCustomers, handleGetCustomerById, handleUpdateMyCustomer }
