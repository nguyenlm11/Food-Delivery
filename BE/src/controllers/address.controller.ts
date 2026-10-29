import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { getIO } from "../configs/socket";
import { AddressCreateParams, AddressSearchQuery, AddressUpdateParams } from "../interfaces/address.interface";
import { handleGetMyAddresses, handleCreateMyAddress, handleUpdateMyAddress, handleSetDefaultAddress, handleDeleteMyAddress } from "../services/address.service";

const getMyAddressesAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED");
    }

    const query: AddressSearchQuery = req.query;
    const data = await handleGetMyAddresses(userId, query);

    return res.status(200).json({
        message: "Get addresses successfully!",
        data
    });
};

const createMyAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED");
    }

    const params: AddressCreateParams = req.body;
    const data = await handleCreateMyAddress(userId, params);

    getIO()
        .to(`user:${userId}`)
        .emit("address:created", {
            addressId: data._id,
            isDefault: data.isDefault
        });

    return res.status(201).json({
        message: "Create address successfully!",
        data
    });
};

const updateMyAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const addressId = String(req.params.addressId);

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED");
    }

    const params: AddressUpdateParams = req.body;
    const data = await handleUpdateMyAddress(
        userId,
        addressId,
        params
    );

    getIO()
        .to(`user:${userId}`)
        .emit("address:updated", { addressId });

    return res.status(200).json({
        message: "Update address successfully!",
        data
    });
};

const setDefaultAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const addressId = String(req.params.addressId);

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED");
    }

    const data = await handleSetDefaultAddress(userId, addressId);

    getIO()
        .to(`user:${userId}`)
        .emit("address:default-changed", {
            addressId
        });

    return res.status(200).json({
        message: "Set default address successfully!",
        data
    });
};

const deleteMyAddressAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const addressId = String(req.params.addressId);

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "CUSTOMER_AUTHENTICATION_REQUIRED");
    }

    const data = await handleDeleteMyAddress(userId, addressId);

    getIO()
        .to(`user:${userId}`)
        .emit("address:deleted", data);

    return res.status(200).json({
        message: "Delete address successfully!",
        data
    });
};

export { getMyAddressesAPI, createMyAddressAPI, updateMyAddressAPI, setDefaultAddressAPI, deleteMyAddressAPI };
