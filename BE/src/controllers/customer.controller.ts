import { Request, Response } from "express"
import { handleGetAllCustomers, handleGetCustomerById, handleDeleteCustomerById, handleUpdateMyCustomer } from "../services/customer.service"
import { AppError } from "../errors/AppError"
import { CustomerSearchQuery, CustomerUpdateParams } from "../interfaces/customer.interface"
import { getIO } from "../configs/socket"

const getAllCustomersAPI = async (req: Request, res: Response) => {
    const query: CustomerSearchQuery = req.query
    const customers = await handleGetAllCustomers(query)

    return res.status(200).json({
        message: "Get all customers successfully!",
        data: customers
    })
}

const getCustomerByIdAPI = async (req: Request, res: Response) => {
    const customerId = String(req.params.customerId)
    const customer = await handleGetCustomerById(customerId)

    return res.status(200).json({
        message: "Get customer successfully!",
        data: customer
    })
}

const updateMyCustomerAPI = async (req: Request, res: Response) => {
    const myId = (req as any).user?.id
    const params: CustomerUpdateParams = req.body

    if (!myId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "CUSTOMER_REQUIRED_FIELDS")
    }

    const data = await handleUpdateMyCustomer(myId, params)
    getIO()
        .to(`user:${myId}`)
        .emit("customer:updated", { customerId: myId })

    return res.status(200).json({
        message: "Update customer information successfully!",
        data: data
    })
}

const deleteCustomerByIdAPI = async (req: Request, res: Response) => {
    const customerId = String(req.params.customerId)
    await handleDeleteCustomerById(customerId)

    getIO()
        .to(["admins", `user:${customerId}`])
        .emit("customer:deleted", { customerId })

    return res.status(200).json({
        message: "Delete customer successfully!",
    })
}

export { getAllCustomersAPI, getCustomerByIdAPI, updateMyCustomerAPI, deleteCustomerByIdAPI }