import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { getIO } from "../configs/socket";
import { AddressCreateParams, AddressSearchQuery, AddressUpdateParams } from "../interfaces/address.interface";
import { handleGetMyAddresses, handleCreateMyAddress, handleUpdateMyAddress, handleSetDefaultAddress, handleDeleteMyAddress } from "../services/address.service";

const getMyAddressesAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const query: AddressSearchQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED");
    }

    const data = await handleGetMyAddresses(userId, query);
    return res.status(200).json({
        message: "Get addresses successfully!",
        data: data
    })
}

const createMyAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const params: AddressCreateParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED")
    }

    if (!params) {
        throw new AppError("Missing required fields!", 400, "ADDRESS_REQUIRED_FIELDS")
    }

    const data = await handleCreateMyAddress(userId, params)

    getIO()
        .to(`user:${userId}`)
        .emit("address:created", {
            addressId: data._id,
            isDefault: data.isDefault
        })

    return res.status(201).json({
        message: "Create address successfully!",
        data: data
    })
}

const updateMyAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const addressId = String(req.params.addressId)
    const params: AddressUpdateParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing update fields!", 400, "ADDRESS_REQUIRED_FIELDS")
    }

    const data = await handleUpdateMyAddress(userId, addressId, params)

    getIO()
        .to(`user:${userId}`)
        .emit("address:updated", { addressId })

    return res.status(200).json({
        message: "Update address successfully!",
        data: data
    })
}

const setDefaultAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const addressId = String(req.params.addressId)

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleSetDefaultAddress(userId, addressId)

    getIO()
        .to(`user:${userId}`)
        .emit("address:updated", { addressId: data.addressId })

    return res.status(200).json({
        message: "Set default address successfully!"
    })
}

const deleteMyAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const addressId = String(req.params.addressId);

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED")
    }

    await handleDeleteMyAddress(userId, addressId)

    getIO()
        .to(`user:${userId}`)
        .emit("address:deleted", { addressId })

    return res.status(200).json({
        message: "Delete address successfully!",
    })
}

export { getMyAddressesAPI, createMyAddressAPI, updateMyAddressAPI, setDefaultAddressAPI, deleteMyAddressAPI };
