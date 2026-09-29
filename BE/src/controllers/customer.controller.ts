import { Request, Response } from "express"
import { handleGetAllCustomers, handleGetCustomerById, handleDeleteCustomerById, handleGetMyCustomer, handleUpdateMyCustomer } from "../services/customer.service"
import { AppError } from "../errors/error"
import { CustomerUpdateParams } from "../interfaces/interface"

const getAllCustomersAPI = async (req: Request, res: Response) => {
    try {
        const customers = await handleGetAllCustomers()

        return res.status(200).json({
            message: "Get all customers successfully!",
            data: customers
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getMyCustomerAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        const data = await handleGetMyCustomer(myId)
        return res.status(200).json({
            message: "Get customer information successfully!",
            data: data
        })
    } 
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getCustomerByIdAPI = async (req: Request, res: Response) => {
    try {
        const customerId = String(req.params.customerId)

        const customer = await handleGetCustomerById(customerId)
        return res.status(200).json({
            message: "Get customer successfully!",
            data: customer
        })
    } 
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateMyCustomerAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id
        const params: CustomerUpdateParams = req.body

        if (!myId) {
            throw new AppError("Unauthorized!", 401)
        }

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty!", 400)
        }

        const data = await handleUpdateMyCustomer(myId, params)
        return res.status(200).json({
            message: "Update customer information successfully!",
            data: data
        })
    } 
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteCustomerByIdAPI = async (req: Request, res: Response) => {
    try {
        const customerId = String(req.params.customerId)

        await handleDeleteCustomerById(customerId)
        return res.status(200).json({
            message: "Delete customer successfully!",
        })
    } 
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { getAllCustomersAPI, getMyCustomerAPI, getCustomerByIdAPI, updateMyCustomerAPI, deleteCustomerByIdAPI }