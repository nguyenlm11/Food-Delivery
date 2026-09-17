import { Request, Response } from "express"
import { RestaurantParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateRestaurant } from "../services/restaurant.service"

const createRestaurantAPI = async (req: Request, res: Response) => {
    try {
        const myId = (req as any).user?.id
        const params: RestaurantParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400);
        }

        const data = await handleCreateRestaurant(myId, params)
        return res.status(201).json({
            message: "Create new restaurant successfully",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        });
    }
}

export { createRestaurantAPI }