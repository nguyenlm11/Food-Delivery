import { Request, Response } from "express"
import { ShipFeeCalculateQuery } from "../interfaces/interface"
import { AppError } from "../errors/AppError"
import { handleCalculateShipFee } from "../services/shipfee.service"

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
    res.status(200).json({
        message: "Calculate ship fee successfully",
        data: data
    })
}

export { calculateShipFeeAPI }
