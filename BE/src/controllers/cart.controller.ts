import { Request, Response } from "express"
import { CartCreateParams } from "../interfaces/interface";
import { AppError } from "../errors/error";
import { handleAddCartItem } from "../services/cart.service";

const addCartItemAPI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        const resId = String(req.params.id)
        const params: CartCreateParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400);
        }

        const data = await handleAddCartItem(userId, resId, params)
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

export { addCartItemAPI }