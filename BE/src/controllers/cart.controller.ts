import { Request, Response } from "express"
import { CartCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/AppError"
import { handleAddCartItem, handleClearCart, handleGetCart, handleGetCartItemById, handleRemoveCartItem } from "../services/cart.service"
import { getIO } from "../configs/socket"

const addCartItemAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const resId = String(req.params.restaurantId)
    const params: CartCreateParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CART_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "CART_REQUIRED_FIELDS")
    }

    const data = await handleAddCartItem(userId, resId, params)

    getIO()
        .to(`user:${userId}`)
        .emit("cart:item:added")

    return res.status(201).json({
        message: "Add food to cart successfully",
        data: data
    })
}

const getCartAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const resId = String(req.params.restaurantId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CART_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetCart(userId, resId)
    return res.status(200).json({
        message: "Get all item successfully",
        data: data
    })
}

const getCartItemByIdAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const itemId = String(req.params.itemId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CART_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetCartItemById(userId, itemId)

    return res.status(200).json({
        message: "Get cart item successfully",
        data: data
    })
}

const removeCartItemAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const itemId = String(req.params.itemId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CART_AUTHENTICATION_REQUIRED")
    }

    await handleRemoveCartItem(itemId, userId)

    getIO()
        .to(`user:${userId}`)
        .emit("cart:item:removed", {
            itemId
        })

    return res.status(200).json({
        message: "Remove successfully"
    })
}

const clearCartAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const restaurantId = String(req.params.restaurantId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CART_AUTHENTICATION_REQUIRED")
    }

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

export { addCartItemAPI, getCartAPI, removeCartItemAPI, clearCartAPI, getCartItemByIdAPI }