import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { handleCalculateOrder, handleCreateOrder, handleGetOrderById, handleGetAllOrders, handleGetMyOrders } from "../services/order.service"
import { CreateOrderBody, GetOrdersQuery, QuoteOrderQuery } from "../interfaces/order.interface"

const quoteOrderAPI = async (req: Request, res: Response) => {
    const customerId = (req as any).user?.id
    const query: QuoteOrderQuery = req.query

    if (!customerId) {
        throw new AppError("Unauthorized!", 401, "ORDER_AUTHENTICATION_REQUIRED")
    }

    if (!query || Object.keys(query).length === 0) {
        throw new AppError("Missing required fields!", 400, "ORDER_REQUIRED_FIELDS")
    }

    const result = await handleCalculateOrder(customerId, query)
    return res.status(200).json({
        message: "Get order quote successfully!",
        data: {
            foodAmount: result.foodAmount,
            shipFee: result.shipFee,
            discountAmount: result.discountAmount,
            totalAmount: result.totalAmount
        }
    })
}

const createOrderAPI = async (req: Request, res: Response) => {
    const customerId = (req as any).user?.id
    const body: CreateOrderBody = req.body

    if (!customerId) {
        throw new AppError("Unauthorized!", 401, "ORDER_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "ORDER_REQUIRED_FIELDS")
    }

    const data = await handleCreateOrder(customerId, body)
    return res.status(201).json({
        message: "Create order successfully!",
        data: data
    })
}

const getOrderByIdAPI = async (req: Request, res: Response) => {
    const orderId = String(req.params.orderId)

    const data = await handleGetOrderById(orderId)
    return res.status(200).json({
        message: "Get order successfully!",
        data: data
    })
}

const getAllOrdersAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const query: GetOrdersQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "ORDER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetAllOrders(query, userId, role)
    return res.status(200).json({
        message: "Get orders successfully!",
        data: data
    })
}

const getMyOrdersAPI = async (req: Request, res: Response) => {
    const customerId = (req as any).user?.id
    const query: GetOrdersQuery = req.query

    if (!customerId) {
        throw new AppError("Unauthorized!", 401, "ORDER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetMyOrders(customerId, query)
    return res.status(200).json({
        message: "Get orders successfully!",
        data: data
    })
}

export { quoteOrderAPI, createOrderAPI, getOrderByIdAPI, getAllOrdersAPI, getMyOrdersAPI }
