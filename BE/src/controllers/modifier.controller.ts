import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { FoodModifierGroupAttachParams, ModifierGroupCreateParams } from "../interfaces/modifier.interface"
import { handleAttachModifierGroupToFood, handleCreateModifierGroup, handleGetRestaurantModifierGroups } from "../services/modifier.service"
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

export { createModifierGroupAPI, getRestaurantModifierGroupsAPI, attachModifierGroupToFoodAPI }
