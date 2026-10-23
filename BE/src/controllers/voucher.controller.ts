import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { handleCreateVoucher, handleGetAllVouchers, handleUpdateVoucherStatus } from "../services/voucher.service"
import { getIO } from "../configs/socket"
import { CreateVoucherParams, VoucherSearchQuery } from "../interfaces/voucher.interface"

const createVoucherAPI = async (req: Request, res: Response) => {
    const creatorId = (req as any).user?.id
    const params: CreateVoucherParams = req.body

    if (!creatorId) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "VOUCHER_REQUIRED_FIELDS")
    }

    const data = await handleCreateVoucher(creatorId, params)

    getIO()
        .emit("voucher:created", {
            data,
            creatorId
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
    const { status } = req.body ?? {}
    if (!status) {
        throw new AppError("Voucher status is required!", 400, "VOUCHER_STATUS_REQUIRED")
    }

    const data = await handleUpdateVoucherStatus(voucherId, status)

    getIO()
        .emit("voucher:statusupdated", {
            voucherId,
            status
        })

    return res.status(200).json({
        message: "Update voucher status successfully!",
        data: data
    })
}

export { createVoucherAPI, getAllVouchersAPI, updateVoucherStatusAPI }


