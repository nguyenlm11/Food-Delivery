import mongoose from "mongoose"
import { AttachModifierGroupToFoodBody, CreateModifierOptionBody, CreateModifierGroupBody, GetModifierGroupsQuery, UpdateModifierGroupBody, UpdateModifierOptionBody } from "../interfaces/modifier.interface"
import { AppError } from "../errors/AppError"
import { FoodModifierGroup, ModifierGroup, ModifierOption } from "../models/modifier.model"
import { Food } from "../models/food.model"
import { Menu } from "../models/menu.model"
import { ensureRestaurantAccess } from "./restaurant.service"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"
import { roundAmount } from "../utils/helper"

const handleCreateModifierGroup = async (userId: string, role: string, params: CreateModifierGroupBody) => {
    const { restaurantId } = params

    if (!params || !params.name?.trim() || !Array.isArray(params.options) || params.options.length === 0) {
        throw new AppError("Group name and at least one option are required!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    if (params.minSelect < 0 || params.minSelect > params.maxSelect) {
        throw new AppError("Modifier group selection limits are invalid!", 400, "MODIFIER_INVALID_SELECTION_LIMITS")
    }

    const optionNames = new Set<string>()

    for (const option of params.options) {
        if (!option?.name?.trim() || !Number.isFinite(option.priceAdjustment)) {
            throw new AppError("Each option needs a name and a valid price adjustment!", 400, "MODIFIER_INVALID_OPTION")
        }

        const optionName = option.name.trim().toLowerCase()
        if (optionNames.has(optionName)) {
            throw new AppError("Option names must be unique!", 400, "MODIFIER_DUPLICATE_OPTION_NAMES")
        }
        optionNames.add(optionName)
    }

    const restaurant = await ensureRestaurantAccess(restaurantId, userId, role, "MODIFIER_ACCESS_FORBIDDEN")

    if (restaurant.status === "DELETED") {
        throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "MODIFIER_RESTAURANT_DELETED")
    }

    const groupName = params.name.trim()

    const existingGroup = await ModifierGroup.findOne({ restaurantId, name: groupName })

    if (existingGroup) {
        throw new AppError("Modifier group name already exists in this restaurant!", 400, "MODIFIER_GROUP_NAME_ALREADY_EXISTS")
    }

    const session = await mongoose.startSession()

    try {
        const result = await session.withTransaction(async () => {
            const [group] = await ModifierGroup.create([{
                restaurantId,
                name: groupName,
                minSelect: params.minSelect,
                maxSelect: params.maxSelect
            }], { session })

            const options = await ModifierOption.create(
                params.options.map((option, index) => ({
                    modifierGroupId: group._id,
                    name: option.name.trim(),
                    priceAdjustment: roundAmount(option.priceAdjustment),
                    sortOrder: index
                })),
                { session, ordered: true }
            )

            return {
                ...group.toObject(),
                options: options.map((opt) => opt.toObject())
            }
        })
        return result
    }
    finally {
        await session.endSession()
    }
}
const ensureGroupOwnership = async (groupId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(groupId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const group = await ModifierGroup.findById(groupId)

    if (!group) {
        throw new AppError("Modifier group not found!", 404, "MODIFIER_GROUP_NOT_FOUND")
    }

    const restaurant = await ensureRestaurantAccess(group.restaurantId.toString(), userId, role, "MODIFIER_ACCESS_FORBIDDEN")

    if (restaurant.status === "DELETED") {
        throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "MODIFIER_RESTAURANT_DELETED")
    }

    return group
}

const ensureOptionOwnership = async (optionId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(optionId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const option = await ModifierOption.findById(optionId)

    if (!option) {
        throw new AppError("Modifier option not found!", 404, "MODIFIER_OPTION_NOT_FOUND")
    }

    const group = await ensureGroupOwnership(option.modifierGroupId.toString(), userId, role)

    return { option, restaurantId: group.restaurantId }
}

const handleGetModifierGroups = async (userId: string, role: string, query: GetModifierGroupsQuery) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const search = query.search?.trim()
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = resolveSortField(query.sortBy, ["createdAt", "updatedAt", "name", "status"], "createdAt")
    const sortOrder = resolveSortOrder(query.sortOrder)
    const skip = (page - 1) * limit
    const mongoQuery: Record<string, any> = {}

    if (query.restaurantId) {
        if (!mongoose.isValidObjectId(query.restaurantId)) {
            throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
        }

        const restaurant = await ensureRestaurantAccess(query.restaurantId, userId, role, "MODIFIER_ACCESS_FORBIDDEN")

        if (restaurant.status === "DELETED") {
            throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "MODIFIER_RESTAURANT_DELETED")
        }

        mongoQuery.restaurantId = query.restaurantId
    }

    if (search) {
        mongoQuery.name = { $regex: search, $options: "i" }
    }

    if (query.status !== undefined) {
        mongoQuery.status = query.status
    }
    else {
        mongoQuery.status = { $ne: "DELETED" }
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [groups, total] = await Promise.all([
        ModifierGroup
            .find(mongoQuery)
            .select("-__v")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        ModifierGroup.countDocuments(mongoQuery)
    ])

    const optionsByGroupId = new Map<string, any[]>()

    if (groups.length > 0) {
        const options = await ModifierOption
            .find({
                modifierGroupId: { $in: groups.map(group => group._id) },
                status: { $ne: "DELETED" }
            })
            .sort({ sortOrder: 1 })
            .lean()

        for (const option of options) {
            const key = option.modifierGroupId.toString()
            const group = optionsByGroupId.get(key)

            if (group) {
                group.push(option)
            }
            else {
                optionsByGroupId.set(key, [option])
            }
        }
    }

    const result = groups.map(group => ({
        ...group,
        options: optionsByGroupId.get(group._id.toString()) ?? []
    }))

    return {
        groups: result,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleGetModifierGroupById = async (groupId: string, userId: string, role: string) => {
    const group = await ensureGroupOwnership(groupId, userId, role)

    const options = await ModifierOption
        .find({ modifierGroupId: group._id, status: { $ne: "DELETED" } })
        .sort({ sortOrder: 1 })
        .lean()

    return {
        ...group.toObject(),
        options
    }
}

const handleGetModifierGroupOptions = async (groupId: string, userId: string, role: string) => {
    const group = await ensureGroupOwnership(groupId, userId, role)

    const options = await ModifierOption
        .find({ modifierGroupId: group._id, status: { $ne: "DELETED" } })
        .sort({ sortOrder: 1 })
        .lean()

    return options
}

const handleUpdateModifierGroup = async (groupId: string, userId: string, role: string, params: UpdateModifierGroupBody) => {
    const { name, minSelect, maxSelect } = params

    if (!mongoose.isValidObjectId(groupId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    if (name === undefined && minSelect === undefined && maxSelect === undefined) {
        throw new AppError("At least one field is required to update!", 400, "MODIFIER_UPDATE_FIELDS_REQUIRED")
    }

    const group = await ensureGroupOwnership(groupId, userId, role)

    if (name !== undefined) {
        const trimmedName = name.trim()

        if (!trimmedName) {
            throw new AppError("Modifier group name is required!", 400, "MODIFIER_REQUIRED_FIELDS")
        }

        const existGroup = await ModifierGroup.findOne({
            restaurantId: group.restaurantId,
            name: trimmedName,
            _id: { $ne: group._id }
        }).lean()

        if (existGroup) {
            throw new AppError("Modifier group name already exists in this restaurant!", 400, "MODIFIER_GROUP_NAME_ALREADY_EXISTS")
        }

        group.name = trimmedName
    }

    const finalMinSelect = minSelect ?? group.minSelect
    const finalMaxSelect = maxSelect ?? group.maxSelect

    if (!Number.isInteger(finalMinSelect) || finalMinSelect < 0 || !Number.isInteger(finalMaxSelect) || finalMaxSelect < 1) {
        throw new AppError("Modifier group selection limits are invalid!", 400, "MODIFIER_INVALID_SELECTION_LIMITS")
    }

    if (finalMinSelect > finalMaxSelect) {
        throw new AppError("Modifier group selection limits are invalid!", 400, "MODIFIER_INVALID_SELECTION_LIMITS")
    }

    group.minSelect = finalMinSelect
    group.maxSelect = finalMaxSelect

    await group.save()

    return group
}

const handleCreateModifierOption = async (userId: string, role: string, params: CreateModifierOptionBody) => {
    const { modifierGroupId, name, priceAdjustment } = params

    if (!params?.name?.trim() || !Number.isFinite(priceAdjustment)) {
        throw new AppError("Option name and a valid price adjustment are required!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    const group = await ensureGroupOwnership(modifierGroupId, userId, role)

    const trimmedName = name.trim()
    const existOption = await ModifierOption.findOne({
        modifierGroupId: group._id,
        name: trimmedName
    }).lean()

    if (existOption) {
        throw new AppError("Option name already exists in this group!", 400, "MODIFIER_OPTION_NAME_ALREADY_EXISTS")
    }

    const maxSortOrder = await ModifierOption
        .find({ modifierGroupId: group._id })
        .sort({ sortOrder: -1 })
        .limit(1)
        .select("sortOrder")
        .lean()

    const option = await ModifierOption.create({
        modifierGroupId: group._id,
        name: trimmedName,
        priceAdjustment: roundAmount(priceAdjustment),
        sortOrder: (maxSortOrder[0]?.sortOrder ?? -1) + 1
    })

    return {
        option,
        restaurantId: group.restaurantId
    }
}

const handleUpdateModifierOption = async (optionId: string, userId: string, role: string, params: UpdateModifierOptionBody) => {
    const { name, priceAdjustment } = params

    if (!mongoose.isValidObjectId(optionId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    if (name === undefined && priceAdjustment === undefined) {
        throw new AppError("At least one field is required to update!", 400, "MODIFIER_UPDATE_FIELDS_REQUIRED")
    }

    const { option, restaurantId } = await ensureOptionOwnership(optionId, userId, role)

    if (name !== undefined) {
        const trimmedName = name.trim()

        if (!trimmedName) {
            throw new AppError("Option name is required!", 400, "MODIFIER_REQUIRED_FIELDS")
        }

        const existOption = await ModifierOption.findOne({
            modifierGroupId: option.modifierGroupId,
            name: trimmedName,
            _id: { $ne: option._id }
        }).lean()

        if (existOption) {
            throw new AppError("Option name already exists in this group!", 400, "MODIFIER_OPTION_NAME_ALREADY_EXISTS")
        }

        option.name = trimmedName
    }

    if (priceAdjustment !== undefined) {
        if (!Number.isFinite(priceAdjustment)) {
            throw new AppError("Invalid price adjustment!", 400, "MODIFIER_INVALID_OPTION")
        }

        option.priceAdjustment = roundAmount(priceAdjustment)
    }

    await option.save()

    return { option, restaurantId }
}

const handleUpdateModifierGroupStatus = async (groupId: string, userId: string, role: string, status: string) => {
    if (!mongoose.isValidObjectId(groupId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "MODIFIER_INVALID_STATUS")
    }

    const group = await ensureGroupOwnership(groupId, userId, role)

    if (group.status === "DELETED") {
        throw new AppError("Modifier group has been deleted, restore the group first!", 400, "MODIFIER_GROUP_DELETED")
    }

    if (group.status === status) {
        throw new AppError(`Modifier group is already ${status.toLowerCase()}!`, 400, "MODIFIER_GROUP_STATUS_UNCHANGED")
    }

    group.status = status as "ACTIVE" | "INACTIVE"
    await group.save()

    return group
}

const handleRestoreModifierGroup = async (groupId: string, userId: string, role: string) => {
    const group = await ensureGroupOwnership(groupId, userId, role)

    if (group.status !== "DELETED") {
        throw new AppError("Modifier group has not been deleted!", 400, "MODIFIER_GROUP_NOT_DELETED")
    }

    group.status = "ACTIVE"
    await group.save()

    return group
}

const handleDeleteModifierGroup = async (groupId: string, userId: string, role: string) => {
    const group = await ensureGroupOwnership(groupId, userId, role)

    if (group.status === "DELETED") {
        throw new AppError("Modifier group has already been deleted!", 400, "MODIFIER_GROUP_ALREADY_DELETED")
    }

    group.status = "DELETED"
    await group.save()

    return group
}

const handleUpdateModifierOptionStatus = async (optionId: string, userId: string, role: string, status: string) => {
    if (!mongoose.isValidObjectId(optionId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "MODIFIER_INVALID_STATUS")
    }

    const { option, restaurantId } = await ensureOptionOwnership(optionId, userId, role)

    if (option.status === "DELETED") {
        throw new AppError("Modifier option has been deleted, restore the option first!", 400, "MODIFIER_OPTION_DELETED")
    }

    if (option.status === status) {
        throw new AppError(`Modifier option is already ${status.toLowerCase()}!`, 400, "MODIFIER_OPTION_STATUS_UNCHANGED")
    }

    option.status = status as "ACTIVE" | "INACTIVE"
    await option.save()

    return { option, restaurantId }
}

const handleRestoreModifierOption = async (optionId: string, userId: string, role: string) => {
    const { option, restaurantId } = await ensureOptionOwnership(optionId, userId, role)

    if (option.status !== "DELETED") {
        throw new AppError("Modifier option has not been deleted!", 400, "MODIFIER_OPTION_NOT_DELETED")
    }

    const group = await ModifierGroup.findById(option.modifierGroupId).select("_id status").lean()

    if (!group) {
        throw new AppError("Modifier group not found!", 404, "MODIFIER_GROUP_NOT_FOUND")
    }

    if (group.status === "DELETED") {
        throw new AppError("Modifier group has been deleted, restore the group first!", 400, "MODIFIER_GROUP_DELETED")
    }

    option.status = "ACTIVE"
    await option.save()

    return { option, restaurantId }
}

const handleDeleteModifierOption = async (optionId: string, userId: string, role: string) => {
    const { option, restaurantId } = await ensureOptionOwnership(optionId, userId, role)

    if (option.status === "DELETED") {
        throw new AppError("Modifier option has already been deleted!", 400, "MODIFIER_OPTION_ALREADY_DELETED")
    }

    option.status = "DELETED"
    await option.save()

    return { option, restaurantId }
}

const handleAttachModifierGroupToFood = async (foodId: string, userId: string, role: string, params: AttachModifierGroupToFoodBody, session?: mongoose.ClientSession) => {
    if (!mongoose.isValidObjectId(foodId) || !mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(params?.modifierGroupId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const food = await Food.findById(foodId).session(session ?? null)

    if (!food) {
        throw new AppError("Food not found!", 404, "MODIFIER_FOOD_NOT_FOUND")
    }

    await ensureRestaurantAccess(food.restaurantId.toString(), userId, role, "MODIFIER_ACCESS_FORBIDDEN", session)

    const group = await ModifierGroup
        .findOne({ _id: params.modifierGroupId, restaurantId: food.restaurantId, status: "ACTIVE" })
        .session(session ?? null)

    if (!group) {
        throw new AppError("Modifier group not found for this restaurant!", 404, "MODIFIER_GROUP_NOT_FOUND")
    }

    const menu = food.menuId ? await Menu.exists({ _id: food.menuId, restaurantId: food.restaurantId }).session(session ?? null) : null
    if (!menu) {
        throw new AppError("Food is not connected to a menu!", 400, "MODIFIER_FOOD_NOT_IN_MENU")
    }

    const alreadyAttached = await FoodModifierGroup
        .exists({ foodId: food._id, modifierGroupId: group._id })
        .session(session ?? null)

    if (alreadyAttached) {
        throw new AppError("Modifier group is already attached to this food!", 400, "MODIFIER_GROUP_ALREADY_ATTACHED")
    }

    if (session) {
        await FoodModifierGroup.create(
            [{ foodId: food._id, modifierGroupId: group._id }],
            { session, ordered: true }
        )
    }
    else {
        const newSession = await mongoose.startSession()
        try {
            await newSession.withTransaction(async () => {
                await FoodModifierGroup.create(
                    [{ foodId: food._id, modifierGroupId: group._id }],
                    { session: newSession, ordered: true }
                )
            })
        }
        finally {
            await newSession.endSession()
        }
    }

    return { foodId, modifierGroupId: group._id, restaurantId: food.restaurantId, menuCount: 1 }
}


export {
    handleCreateModifierGroup,
    handleGetModifierGroups,
    handleGetModifierGroupById,
    handleGetModifierGroupOptions,
    handleUpdateModifierGroup,
    handleCreateModifierOption,
    handleUpdateModifierOption,
    handleAttachModifierGroupToFood,
    handleUpdateModifierGroupStatus,
    handleRestoreModifierGroup,
    handleDeleteModifierGroup,
    handleUpdateModifierOptionStatus,
    handleRestoreModifierOption,
    handleDeleteModifierOption
}
