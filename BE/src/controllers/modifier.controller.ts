import { Request, Response } from "express"
import { AppError } from "../errors/AppError"
import { AttachModifierGroupToFoodBody, CreateModifierGroupBody, CreateModifierOptionBody, GetModifierGroupsQuery, UpdateModifierGroupBody, UpdateModifierOptionBody } from "../interfaces/modifier.interface"
import { handleAttachModifierGroupToFood, handleCreateModifierGroup, handleCreateModifierOption, handleDeleteModifierGroup, handleDeleteModifierOption, handleGetModifierGroupById, handleGetModifierGroupOptions, handleGetModifierGroups, handleRestoreModifierGroup, handleRestoreModifierOption, handleUpdateModifierGroup, handleUpdateModifierGroupStatus, handleUpdateModifierOption, handleUpdateModifierOptionStatus } from "../services/modifier.service"
import { getIO } from "../configs/socket"

const createModifierGroupAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: CreateModifierGroupBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleCreateModifierGroup(userId, role, body)

    getIO()
        .to(`restaurant:${body.restaurantId}`)
        .emit("modifier:created", { restaurantId: body.restaurantId })

    return res.status(201).json({
        message: "Create modifier group successfully!",
        data: data
    })
}

const getModifierGroupsAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const query: GetModifierGroupsQuery = req.query

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!query.restaurantId && role !== "ADMIN") {
        throw new AppError("restaurantId is required!", 400, "MODIFIER_RESTAURANT_ID_REQUIRED")
    }

    const data = await handleGetModifierGroups(userId, role, query)
    return res.status(200).json({
        message: "Get modifier groups successfully!",
        data: data
    })
}

const getModifierGroupByIdAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetModifierGroupById(modifierGroupId, userId, role)
    return res.status(200).json({
        message: "Get modifier group successfully!",
        data: data
    })
}

const getModifierGroupOptionsAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleGetModifierGroupOptions(modifierGroupId, userId, role)
    return res.status(200).json({
        message: "Get modifier options successfully!",
        data: data
    })
}

const updateModifierGroupAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: UpdateModifierGroupBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const data = await handleUpdateModifierGroup(modifierGroupId, userId, role, body)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:updated", {
            modifierGroupId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update modifier group successfully!",
        data: data
    })
}

const createModifierOptionAPI = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: CreateModifierOptionBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const { option, restaurantId } = await handleCreateModifierOption(userId, role, body)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:updated", {
            modifierGroupId: option.modifierGroupId,
            modifierOptionId: option._id
        })

    return res.status(201).json({
        message: "Create modifier option successfully!",
        data: option
    })
}

const updateModifierOptionAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: UpdateModifierOptionBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const { option, restaurantId } = await handleUpdateModifierOption(modifierOptionId, userId, role, body)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:updated", {
            modifierOptionId,
            status: option.status
        })

    return res.status(200).json({
        message: "Update modifier option successfully!",
        data: option
    })
}

const attachModifierGroupToFoodAPI = async (req: Request, res: Response) => {
    const foodId = String(req.params.foodId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body: AttachModifierGroupToFoodBody = req.body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const data = await handleAttachModifierGroupToFood(foodId, userId, role, body)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:updated", {
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
    const role = (req as any).user?.role
    const body = req.body ?? {}
    const { status } = body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleUpdateModifierGroupStatus(modifierGroupId, userId, role, status)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:updated", {
            modifierGroupId,
            status: data.status
        })

    return res.status(200).json({
        message: "Update modifier group status successfully!",
        data: data
    })
}

const restoreModifierGroupAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleRestoreModifierGroup(modifierGroupId, userId, role)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:updated", {
            modifierGroupId,
            status: data.status
        })

    return res.status(200).json({
        message: "Restore modifier group successfully!",
        data: data
    })
}

const deleteModifierGroupAPI = async (req: Request, res: Response) => {
    const modifierGroupId = String(req.params.modifierGroupId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const data = await handleDeleteModifierGroup(modifierGroupId, userId, role)

    getIO()
        .to(`restaurant:${data.restaurantId}`)
        .emit("modifier:deleted", { modifierGroupId, status: data.status })

    return res.status(200).json({
        message: "Delete modifier group successfully!",
        data: data
    })
}

const restoreModifierOptionAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const { option, restaurantId } = await handleRestoreModifierOption(modifierOptionId, userId, role)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:updated", {
            modifierOptionId,
            status: option.status
        })

    return res.status(200).json({
        message: "Restore modifier option successfully!",
        data: option
    })
}

const updateModifierOptionStatusAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role
    const body = req.body ?? {}
    const { status } = body

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const { option, restaurantId } = await handleUpdateModifierOptionStatus(modifierOptionId, userId, role, status)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:updated", {
            modifierOptionId,
            status: option.status
        })

    return res.status(200).json({
        message: "Update modifier option status successfully!",
        data: option
    })
}

const deleteModifierOptionAPI = async (req: Request, res: Response) => {
    const modifierOptionId = String(req.params.modifierOptionId)
    const userId = (req as any).user?.id
    const role = (req as any).user?.role

    if (!userId) {
        throw new AppError("Unauthorized!", 401, "MODIFIER_AUTHENTICATION_REQUIRED")
    }

    const { option, restaurantId } = await handleDeleteModifierOption(modifierOptionId, userId, role)

    getIO()
        .to(`restaurant:${restaurantId}`)
        .emit("modifier:deleted", { modifierOptionId, status: option.status })

    return res.status(200).json({
        message: "Delete modifier option successfully!",
        data: option
    })
}

export {
    createModifierGroupAPI,
    getModifierGroupsAPI,
    getModifierGroupByIdAPI,
    getModifierGroupOptionsAPI,
    updateModifierGroupAPI,
    createModifierOptionAPI,
    updateModifierOptionAPI,
    attachModifierGroupToFoodAPI,
    updateModifierGroupStatusAPI,
    restoreModifierGroupAPI,
    deleteModifierGroupAPI,
    updateModifierOptionStatusAPI,
    restoreModifierOptionAPI,
    deleteModifierOptionAPI
}
