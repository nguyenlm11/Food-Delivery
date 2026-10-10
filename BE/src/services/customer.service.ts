import User from '../models/user.model'
import Role from "../models/role.model"
import OTP from "../models/otp.model"
import mongoose from "mongoose"
import { AppError } from "../errors/error"
import { CustomerUpdateParams } from '../interfaces/interface'

const handleGetAllCustomers = async () => {
    const customerRole = await Role.findOne({ name: "CUSTOMER" })
    return await User
        .find({ roleId: customerRole?._id })
        .populate("roleId", "name") // path, select
        .select("-password")
        .lean()
}

const handleGetCustomerById = async (customerId: string) => {
    if (!mongoose.isValidObjectId(customerId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const customerRole = await Role.findOne({ name: "CUSTOMER" })

    if (!customerRole) {
        throw new AppError("Customer role not found!", 500)
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
        throw new AppError("Customer not found!", 404)
    }

    return customer
}

const handleUpdateMyCustomer = async (id: string, params: CustomerUpdateParams) => {
    const { fullname, birthday, address, phone } = params

    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400)
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

    const customerData: Record<string, any> = {}
    if (fullname !== undefined) customerData.fullname = fullname
    if (birthday !== undefined) customerData.birthday = birthday ? new Date(birthday) : null
    if (address !== undefined) customerData.address = address
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
        throw new AppError("User not found!", 404)
    }

    return updatedCustomer
}

const handleDeleteCustomerById = async (customerId: string) => {
    if (!mongoose.isValidObjectId(customerId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const customerRole = await Role.findOne({ name: "CUSTOMER" })

    if (!customerRole) {
        throw new AppError("Customer role not found!", 500)
    }

    const customer = await User.findOne({
        _id: customerId,
        roleId: customerRole._id
    })

    if (!customer) {
        throw new AppError("Customer not found!", 404)
    }

    if (customer.status === "DELETED") {
        throw new AppError("Customer has already been deleted!", 400)
    }

    customer.status = "DELETED"
    await customer.save()

    await OTP.deleteMany({ userId: customer._id })
}

export { handleGetAllCustomers, handleGetCustomerById, handleUpdateMyCustomer, handleDeleteCustomerById }