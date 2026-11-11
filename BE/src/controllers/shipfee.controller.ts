import { Request, Response } from "express"
import { CreateShipFeeParams, ShipFeeCalculateQuery, ShipFeeSearchQuery, UpdateShipFeeParams } from "../interfaces/shipfee.interface"
import { AppError } from "../errors/AppError"
import { handleCalculateShipFee, handleCreateShipFee, handleDeleteShipFee, handleGetAllShipFee, handleRestoreShipFee, handleUpdateShipFee, handleUpdateShipFeeStatus } from "../services/shipfee.service"
import { getIO } from "../configs/socket"

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

    getIO()
        .to(["admins", "customers"])
        .emit("shipfee:created", { shipFeeId: data._id })

    return res.status(201).json({
        message: "Create new ship-fee successfully",
        data: data
    })
}

const updateShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const params: UpdateShipFeeParams = req.body
    const shipId = String(req.params.id)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "SHIPFEE_REQUIRED_FIELDS")
    }

    const data = await handleUpdateShipFee(shipId, params)

    getIO()
        .to(["admins", "customers"])
        .emit("shipfee:updated", { shipFeeId: shipId, status: data.status })

    return res.status(200).json({
        message: "Update ship-fee successfully",
        data: data
    })
}

const updateShipFeeStatusAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const shipId = String(req.params.id)
    const { status } = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateShipFeeStatus(shipId, status)

    getIO()
        .to(["admins", "customers"])
        .emit("shipfee:updated", {
            shipFeeId: shipId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update ship-fee status successfully"
    })
}

const deleteShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const shipId = String(req.params.id)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteShipFee(shipId)

    getIO()
        .to(["admins", "customers"])
        .emit("shipfee:deleted", { shipFeeId: shipId, status: data.status })

    return res.status(200).json({
        message: "Delete ship-fee successfully"
    })
}

const restoreShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const shipId = String(req.params.id)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleRestoreShipFee(shipId)

    getIO()
        .to(["admins", "customers"])
        .emit("shipfee:updated", { shipFeeId: shipId, status: data.status })

    return res.status(200).json({
        message: "Restore ship-fee successfully"
    })
}

export { calculateShipFeeAPI, getAllShipFeesAPI, createShipFeeAPI, updateShipFeeAPI, updateShipFeeStatusAPI, deleteShipFeeAPI, restoreShipFeeAPI }
