import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { FoodModifierGroupAttachParams, ModifierGroupCreateParams } from "../interfaces/modifier.interface"
import { handleAttachModifierGroupToFood, handleCreateModifierGroup, handleDeleteModifierGroup, handleDeleteModifierOption, handleGetRestaurantModifierGroups, handleRestoreModifierGroup, handleRestoreModifierOption, handleUpdateModifierGroupStatus, handleUpdateModifierOptionStatus } from "../services/modifier.service"
import { getIO } from "../configs/socket"

const createModifierGroupAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id
    const params: ModifierGroupCreateParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const data = await handleCreateModifierGroup(restaurantId, userId, params)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:created", {
            restaurantId,
            modifierGroupId: data.modifierGroupId
        })

    return res.status(201).json({
        message: "Create modifier group successfully!",
        data: data
    })
}

const getRestaurantModifierGroupsAPI = async (req: Request, res: Response) => {
    const restaurantId = String(req.params.restaurantId)
    const userId = (req as any).user?.id

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetRestaurantModifierGroups(restaurantId, userId)
    return res.status(200).json({
        message: "Get restaurant modifier groups successfully!",
        data: data
    })
}

const attachModifierGroupToFoodAPI = async (req: Request, res: Response) => {
    const foodId = String(req.params.foodId)
    const userId = (req as any).user?.id
    const params: FoodModifierGroupAttachParams = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const data = await handleAttachModifierGroupToFood(foodId, userId, params)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:attached", {
            foodId,
            modifierGroupId: data.modifierGroupId
        })

    return res.status(201).json({
        message: "Attach modifier group to food successfully!",
        data: data
    })
}

const updateModifierGroupStatusAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id
    const { status } = req.body ?? {}

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateModifierGroupStatus(modifierGroupId, userId, status)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:updated", {
            modifierGroupId,
            status
        })

    return res.status(200).json({
        message: "Update modifier group status successfully!",
        data: data
    })
}

const deleteModifierGroupAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteModifierGroup(modifierGroupId, userId)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:deleted", { modifierGroupId })

    return res.status(200).json({
        message: "Delete modifier group successfully!",
        data: data
    })
}

const restoreModifierGroupAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleRestoreModifierGroup(modifierGroupId, userId)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:restored", { modifierGroupId })

    return res.status(200).json({
        message: "Restore modifier group successfully!",
        data: data
    })
}

const updateModifierOptionStatusAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id
    const { status } = req.body ?? {}

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const { option, restaurantId } = await handleUpdateModifierOptionStatus(modifierOptionId, userId, status)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:updated", {
            modifierOptionId,
            status
        })

    return res.status(200).json({
        message: "Update modifier option status successfully!",
        data: option
    })
}

const deleteModifierOptionAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const { option, restaurantId } = await handleDeleteModifierOption(modifierOptionId, userId)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:deleted", { modifierOptionId })

    return res.status(200).json({
        message: "Delete modifier option successfully!",
        data: option
    })
}

const restoreModifierOptionAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const { option, restaurantId } = await handleRestoreModifierOption(modifierOptionId, userId)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:restored", { modifierOptionId })

    return res.status(200).json({
        message: "Restore modifier option successfully!",
        data: option
    })
}

export { createModifierGroupAPI, getRestaurantModifierGroupsAPI, attachModifierGroupToFoodAPI, updateModifierGroupStatusAPI, deleteModifierGroupAPI, restoreModifierGroupAPI, updateModifierOptionStatusAPI, deleteModifierOptionAPI, restoreModifierOptionAPI }
