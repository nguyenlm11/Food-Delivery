import { Request, Response } from "express"
import { CartCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/AppError"
import { handleAddCartItem, handleClearCart, handleGetCart, handleRemoveCartItem } from "../services/cart.service"
import { getIO } from "../configs/socket"

const addCartItemAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const resId = String(req.params.restaurantId)
        const params: CartCreateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400);
        }

        const data = await handleAddCartItem(userId, resId, params)

        getIO()
            .to(`user:${userId}`)
            .emit("cart:item:added", {
                cartId: data.cartId,
                foodId: data.foodId
            })

        return res.status(201).json({
            message: "Add food to cart successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getCartAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const resId = String(req.params.restaurantId)

        const data = await handleGetCart(userId, resId)
        return res.status(200).json({
            message: "Get all item successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const removeCartItemAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const itemId = String(req.params?.id)

        await handleRemoveCartItem(itemId)

        getIO()
            .to(`user:${userId}`)
            .emit("cart:item:removed", {
                itemId
            })

        return res.status(200).json({
            message: "Remove successfully"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const clearCartAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const restaurantId = String(req.params.restaurantId)

        await handleClearCart(userId, restaurantId)

        getIO()
            .to(`user:${userId}`)
            .emit("cart:cleared", {
                userId,
                restaurantId
            })

        return res.status(200).json({
            message: "Clear cart successfully"
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { addCartItemAPI, getCartAPI, removeCartItemAPI, clearCartAPI }