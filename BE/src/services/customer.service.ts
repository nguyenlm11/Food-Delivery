import User from '../models/user.model'
import Role from "../models/role.model"
import OTP from "../models/otp.model"
import mongoose from "mongoose"
import { AppError } from "../errors/error"

const handleGetAllCustomers = async () => {
    const customerRole = await Role.findOne({ name: "CUSTOMER" })
    return await User
        .find({ roleId: customerRole?._id })
        .populate("roleId", "name") // path, select
        .select("-password")
        .lean()
}

const handleGetCustomerById = async (customerId: string) => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new AppError("Invalid customer id!", 400)
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

const handleDeleteCustomerById = async (customerId: string) => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new AppError("Invalid customer id!", 400)
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

export { handleGetAllCustomers, handleGetCustomerById, handleDeleteCustomerById }