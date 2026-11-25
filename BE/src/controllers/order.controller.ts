import { Request, Response } from "express"
import { handleCancelOrder, handleCreateOrder, handleGetOrderById, handleGetOrders, handleUpdateOrderStatus } from "../services/order.service"
import { CancelOrderBody, CreateOrderBody, UpdateOrderStatusBody } from "../interfaces/order.interface"
import { AppError } from "../errors/AppError"
import { getIO } from "../configs/socket"

const createOrderAPI = async (req: Request, res: Response) => {
    const body: CreateOrderBody = req.body
    const user = (req as any).user

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "ORDER_REQUIRED_FIELDS")
    }

    const data = await handleCreateOrder(user.id, body)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .to(`user:${data.customerId}`)
        .emit("order:created", { orderId: data._id, orderCode: data.orderCode, status: data.status })

    return res.status(201).json({
        message: "Order created successfully!",
        data: data
    })
}

const getOrdersAPI = async (req: Request, res: Response) => {
    const user = (req as any).user
    const query = req.query as any

    const data = await handleGetOrders(query, user.id, user.role)

    return res.status(200).json({
        message: "Get orders successfully!",
        data: {
            orders: data.orders,
            pagination: data.pagination
        }
    })
}

const getOrderByIdAPI = async (req: Request, res: Response) => {
    const user = (req as any).user
    const orderId = String(req.params.orderId)

    const data = await handleGetOrderById(orderId, user.id, user.role)

    return res.status(200).json({
        message: "Get order successfully!",
        data: data
    })
}

const updateOrderStatusAPI = async (req: Request, res: Response) => {
    const user = (req as any).user
    const orderId = String(req.params.orderId)
    const body: UpdateOrderStatusBody = req.body

    if (!body?.status) {
        throw new AppError("Status is required!", 400, "ORDER_STATUS_REQUIRED")
    }

    const data = await handleUpdateOrderStatus(orderId, user.id, user.role, body.status)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .to(`user:${data.customerId}`)
        .emit("order:updated", { orderId: data._id, orderCode: data.orderCode, status: data.status })

    return res.status(200).json({
        message: "Order status updated successfully!",
        data: data
    })
}

const cancelOrderAPI = async (req: Request, res: Response) => {
    const user = (req as any).user
    const orderId = String(req.params.orderId)
    const body: CancelOrderBody = req.body

    const data = await handleCancelOrder(orderId, user.id, user.role, body)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .to(`user:${data.customerId}`)
        .emit("order:updated", { orderId: data._id, orderCode: data.orderCode, status: data.status })

    return res.status(200).json({
        message: "Order cancelled successfully!",
        data: data
    })
}

export { createOrderAPI, getOrdersAPI, getOrderByIdAPI, updateOrderStatusAPI, cancelOrderAPI }
