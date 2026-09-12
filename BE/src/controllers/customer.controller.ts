import { Request, Response } from "express";
import { handleGetAllCustomers, handleGetCustomerById, handleDeleteCustomerById } from "../services/customer.service";

const getAllCustomersAPI = async (req: Request, res: Response) => {
    try {
        const users = await handleGetAllCustomers();

        return res.status(200).json({
            message: "Get all customers successfully!",
            data: users
        });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        });
    }
}

const getCustomerByIdAPI = async (req: Request, res: Response) => {
    try {
        const customer = await handleGetCustomerById(String(req.params.id));

        return res.status(200).json({
            message: "Get customer successfully!",
            data: customer
        });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        });
    }
};

const deleteCustomerByIdAPI = async (req: Request, res: Response) => {
    try {
        const customerId = String(req.params.id);

        const customer = await handleDeleteCustomerById(customerId);

        return res.status(200).json({
            message: "Customer deleted successfully!",
            data: customer
        });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        });
    }
};

export { getAllCustomersAPI, getCustomerByIdAPI, deleteCustomerByIdAPI }