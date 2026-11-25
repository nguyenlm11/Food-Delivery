import { Request, Response } from "express"
import { CreateShipFeeBody, CalculateShipFeeQuery, GetShipFeesQuery, UpdateShipFeeBody } from "../interfaces/shipfee.interface"
import { AppError } from "../errors/AppError"
import { handleCalculateShipFee, handleCreateShipFee, handleDeleteShipFee, handleGetAllShipFee, handleGetShipFeeById, handleRestoreShipFee, handleUpdateShipFee, handleUpdateShipFeeStatus } from "../services/shipfee.service"
import { getIO } from "../configs/socket"

const calculateShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const query: CalculateShipFeeQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    if (!query || Object.keys(query).length === 0) {
        throw new AppError("Missing required fields!", 400, "SHIPFEE_REQUIRED_FIELDS")
    }

    if (!query.restaurantId) {
        throw new AppError("restaurantId is required!", 400, "SHIPFEE_RESTAURANT_ID_REQUIRED")
    }

    const data = await handleCalculateShipFee(String(query.restaurantId), query)
    return res.status(200).json({
        message: "Calculate ship-fee successfully",
        data: data
    })
}

const getAllShipFeesAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const query: GetShipFeesQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetAllShipFee(query)
    return res.status(200).json({
        message: "Get all ship-fee successfully",
        data: data
    })
}

const getShipFeeByIdAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const shipId = String(req.params.shipFeeId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetShipFeeById(shipId)
    return res.status(200).json({
        message: "Get ship-fee information successfully",
        data: data
    })
}

const createShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const body: CreateShipFeeBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "SHIPFEE_REQUIRED_FIELDS")
    }

    const data = await handleCreateShipFee(body)

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
    const body: UpdateShipFeeBody = req.body
    const shipId = String(req.params.shipFeeId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "SHIPFEE_REQUIRED_FIELDS")
    }

    const data = await handleUpdateShipFee(shipId, body)

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
    const shipId = String(req.params.shipFeeId)
    const body = req.body ?? {}
    const { status } = body

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

const restoreShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const shipId = String(req.params.shipFeeId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "SHIPFEE_AUTHENTICATION_REQUIRED")
    }

    const data = await handleRestoreShipFee(shipId)

    getIO()
        .to(["admins", "customers"])
        .emit("shipfee:updated", {
            shipFeeId: shipId,
            status: data.status
        })

    return res.status(200).json({
        message: "Restore ship-fee successfully",
        data: data
    })
}

const deleteShipFeeAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const shipId = String(req.params.shipFeeId)

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

export { calculateShipFeeAPI, getAllShipFeesAPI, getShipFeeByIdAPI, createShipFeeAPI, updateShipFeeAPI, updateShipFeeStatusAPI, restoreShipFeeAPI, deleteShipFeeAPI }