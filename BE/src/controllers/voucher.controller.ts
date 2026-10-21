import { Request, Response } from "express"
import { CreateVoucherParams, VoucherSearchQuery } from "../interfaces/interface"
import { AppError } from "../errors/AppError"
import { handleCreateVoucher, handleGetAllVouchers } from "../services/voucher.service"
import { getIO } from "../configs/socket"

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

export { createVoucherAPI, getAllVouchersAPI }
