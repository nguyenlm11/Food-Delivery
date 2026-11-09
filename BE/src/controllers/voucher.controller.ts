import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { handleCreateVoucher, handleDeleteVoucher, handleGetAllVouchers, handleUpdateVoucher, handleUpdateVoucherStatus } from "../services/voucher.service"
import { getIO } from "../configs/socket"
import { VoucherParams, VoucherSearchQuery, VoucherUpdateParams } from "../interfaces/voucher.interface"

const createVoucherAPI = async (req: Request, res: Response) => {
    const creatorId = (req as any).user?.id
    const params: VoucherParams = req.body

    if (!creatorId) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "VOUCHER_REQUIRED_FIELDS")
    }

    const data = await handleCreateVoucher(creatorId, params)


    const targets = data.restaurantId ? ["admins", `restaurant:${data.restaurantId}`] : ["admins"]

    getIO()
        .to(targets)
        .emit("voucher:created", {
            voucherId: data._id,
            restaurantId: data.restaurantId ?? null
        })

    return res.status(201).json({
        message: "Create voucher successfully!",
        data: data
    })
}

const getAllVouchersAPI = async (req: Request, res: Response) => {
    const query: VoucherSearchQuery = req.query

    const data = await handleGetAllVouchers(query)
    return res.status(200).json({
        message: "Get all vouchers successfully!",
        data: data
    })
}

const updateVoucherStatusAPI = async (req: Request, res: Response) => {
    const voucherId = String(req.params.voucherId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const { status } = req.body ?? {}
    if (!status) {
        throw new AppError("Voucher status is required!", 400, "VOUCHER_STATUS_REQUIRED")
    }

    const data = await handleUpdateVoucherStatus(voucherId, userId, role, status)

    const targets = data.restaurantId ? ["admins", `restaurant:${data.restaurantId}`] : ["admins"]

    getIO()
        .to(targets)
        .emit("voucher:updated", {
            voucherId,
            status
        })

    return res.status(200).json({
        message: "Update voucher status successfully!",
        data: data
    })
}

const updateVoucherAPI = async (req: Request, res: Response) => {
    const voucherId = String(req.params.voucherId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const params: VoucherUpdateParams = req.body

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateVoucher(voucherId, userId, role, params)

    const targets = data.restaurantId ? ["admins", `restaurant:${data.restaurantId}`] : ["admins"]

    getIO()
        .to(targets)
        .emit("voucher:updated", { voucherId })

    return res.status(200).json({
        message: "Update voucher successfully!",
        data: data
    })
}

const deleteVoucherAPI = async (req: Request, res: Response) => {
    const voucherId = String(req.params.voucherId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId || !role) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteVoucher(voucherId, userId, role)

    const targets = data.restaurantId ? ["admins", `restaurant:${data.restaurantId}`] : ["admins"]

    getIO()
        .to(targets)
        .emit("voucher:deleted", { voucherId })

    return res.status(200).json({
        message: "Delete voucher successfully!",
    })
}

export { createVoucherAPI, getAllVouchersAPI, updateVoucherStatusAPI, updateVoucherAPI, deleteVoucherAPI }
