import { Request, Response } from "express"
import { CreateShipFeeParams, ShipFeeCalculateQuery, ShipFeeSearchQuery } from "../interfaces/shipfee.interface"
import { AppError } from "../errors/AppError"
import { handleCalculateShipFee, handleCreateShipFee, handleGetAllShipFee } from "../services/shipfee.service"

const calculateShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const restaurantId = String(req.params.restaurantId)
    const params: ShipFeeCalculateQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "SHIPFEE_REQUIRED_FIELDS")
    }

    const data = await handleCalculateShipFee(restaurantId, params)
    return res.status(200).json({
        message: "Calculate ship-fee successfully",
        data: data
    })
}

const getAllShipFeesAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const query: ShipFeeSearchQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetAllShipFee(query)
    return res.status(200).json({
        message: "Get all ship-fee successfully",
        data: data
    })
}

const createShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const params: CreateShipFeeParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "SHIPFEE_REQUIRED_FIELDS")
    }

    const data = await handleCreateShipFee(params)
    return res.status(201).json({
        message: "Create new ship-fee successfully",
        data: data
    })
}

export { calculateShipFeeAPI, getAllShipFeesAPI, createShipFeeAPI }
