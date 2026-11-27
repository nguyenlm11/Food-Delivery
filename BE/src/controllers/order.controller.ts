import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { handleCreateOrder, handleQuoteOrder } from "../services/order.service"
import { CreateOrderBody, QuoteOrderQuery } from "../interfaces/order.interface"

const quoteOrderAPI = async (req: Request, res: Response) => {
    const customerId = (req as any).user?.id
    const query = req.query as unknown as QuoteOrderQuery

    if (!customerId) {
        throw new AppError("Unauthorized!", 401, "ORDER_AUTHENTICATION_REQUIRED")
    }

    if (!query || Object.keys(query).length === 0) {
        throw new AppError("Missing required fields!", 400, "ORDER_REQUIRED_FIELDS")
    }

    const data = await handleQuoteOrder(customerId, query)

    return res.status(200).json({
        message: "Get order quote successfully!",
        data: data
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

    // const data = await handleCreateOrder(customerId, body)

    return res.status(201).json({
        message: "Create order successfully!",
        // data: data
    })
}

export { quoteOrderAPI, createOrderAPI }
