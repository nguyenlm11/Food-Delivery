import { Request, Response } from "express"
import { RestaurantParams, RestaurantSearchQuery } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { handleCreateRestaurant, handleGetAllRestaurants, handleGetRestaurantById } from "../services/restaurant.service"

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
        })
    }
}

const getAllRestaurantsAPI = async (req: Request, res: Response) => {
    try {
        const query: RestaurantSearchQuery = req.query

        const data = await handleGetAllRestaurants(query)
        return res.status(200).json({
            message: "Get all restaurants successfull",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

const getRestaurantByIdAPI = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id)

        const data = await handleGetRestaurantById(id)
        return res.status(200).json({
            message: "Get information successfull",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || "Internal server error",
        })
    }
}

export { createRestaurantAPI, getAllRestaurantsAPI, getRestaurantByIdAPI }