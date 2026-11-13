import mongoose from "mongoose"
import { FoodModifierGroupAttachParams, ModifierGroupCreateParams } from "../interfaces/modifier.interface"
import { AppError } from "../errors/AppError"
import ModifierGroup from "../models/modifier_group.model"
import ModifierOption from "../models/modifier_option.model"
import FoodModifierGroup from "../models/food_modifier_group.model"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import Menu from "../models/menu.model"
import { ensureRestaurantAccess } from "./restaurant.service"

const handleCreateModifierGroup = async (restaurantId: string, userId: string, role: string, params: ModifierGroupCreateParams, session?: mongoose.ClientSession) => {
    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    if (!params || !params.name?.trim() || !Array.isArray(params.options) || params.options.length === 0) {
        throw new AppError("Group name and at least one option are required!", 400, "MODIFIER_REQUIRED_FIELDS")
    }

    if (!Number.isInteger(params.minSelect) || !Number.isInteger(params.maxSelect) || params.minSelect < 0 || params.minSelect > params.maxSelect) {
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

    const restaurant = await ensureRestaurantAccess(restaurantId, userId, role, "MODIFIER_ACCESS_FORBIDDEN", session)

    if (restaurant?.status === "DELETED") {
        throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "MODIFIER_RESTAURANT_DELETED")
    }

    const groupName = params.name.trim()

    const existingGroup = await ModifierGroup
        .findOne({ restaurantId, name: groupName })
        .session(session ?? null)

    if (existingGroup) {
        throw new AppError("Modifier group name already exists in this restaurant!", 400, "MODIFIER_GROUP_NAME_ALREADY_EXISTS")
    }

    const saveModifierGroup = async (activeSession: mongoose.ClientSession) => {
        const [group] = await ModifierGroup.create([{
            restaurantId,
            name: groupName,
            minSelect: params.minSelect,
            maxSelect: params.maxSelect
        }], { session: activeSession })

        await ModifierOption.create(
            params.options.map((option, index) => ({
                modifierGroupId: group._id,
                name: option.name.trim(),
                priceAdjustment: option.priceAdjustment,
                sortOrder: index
            })),
            { session: activeSession, ordered: true }
        )

        return group._id
    }

    if (session) {
        const modifierGroupId = await saveModifierGroup(session)
        return { modifierGroupId }
    }

    const newSession = await mongoose.startSession()
    let modifierGroupId: mongoose.Types.ObjectId | null = null
    try {
        await newSession.withTransaction(async () => {
            modifierGroupId = await saveModifierGroup(newSession)
        })
    }
    finally {
        await newSession.endSession()
    }

    if (!modifierGroupId) {
        throw new AppError("Modifier group could not be created!", 500, "MODIFIER_GROUP_CREATION_FAILED")
    }

    return { modifierGroupId }
}

const handleGetRestaurantModifierGroups = async (restaurantId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const restaurant = await ensureRestaurantAccess(restaurantId, userId, role, "MODIFIER_ACCESS_FORBIDDEN")

    const restaurantStatus = restaurant
        ? restaurant.status
        : (await Restaurant.findById(restaurantId).select("status").lean())?.status

    if (restaurantStatus === "DELETED") {
        throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "MODIFIER_RESTAURANT_DELETED")
    }

    const groups = await ModifierGroup
        .find({ restaurantId, status: { $ne: "DELETED" } })
        .select("-__v")
        .sort({ createdAt: 1 })
        .lean()

    const groupIds = groups.map(group => group._id)
    const options = await ModifierOption
        .find({ modifierGroupId: { $in: groupIds }, status: { $ne: "DELETED" } })
        .select("-__v")
        .sort({ sortOrder: 1 })
        .lean()

    return groups.map(group => ({
        ...group,
        options: options.filter(option => option.modifierGroupId.toString() === group._id.toString())
    }))
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

    const restaurantStatus = restaurant
        ? restaurant.status
        : (await Restaurant.findById(group.restaurantId).select("status").lean())?.status

    if (restaurantStatus === "DELETED") {
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

const handleUpdateModifierGroupStatus = async (groupId: string, userId: string, role: string, status: string) => {
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "MODIFIER_INVALID_STATUS")
    }

    const group = await ensureGroupOwnership(groupId, userId, role)

    if (group.status === "DELETED") {
        throw new AppError("Modifier group has been deleted!", 400, "MODIFIER_GROUP_DELETED")
    }

    if (group.status === status) {
        throw new AppError(`Modifier group is already ${status.toLowerCase()}!`, 400, "MODIFIER_GROUP_STATUS_UNCHANGED")
    }

    group.status = status as "ACTIVE" | "INACTIVE"
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

    await ModifierOption.updateMany(
        { modifierGroupId: group._id, status: { $ne: "DELETED" } },
        { $set: { status: "DELETED" } }
    )

    return group
}

const handleRestoreModifierGroup = async (groupId: string, userId: string, role: string) => {
    const group = await ensureGroupOwnership(groupId, userId, role)

    if (group.status !== "DELETED") {
        throw new AppError("Modifier group has not been deleted!", 400, "MODIFIER_GROUP_NOT_DELETED")
    }

    group.status = "ACTIVE"
    await group.save()

    await ModifierOption.updateMany(
        { modifierGroupId: group._id, status: "DELETED" },
        { $set: { status: "ACTIVE" } }
    )

    return group
}

const handleUpdateModifierOptionStatus = async (optionId: string, userId: string, role: string, status: string) => {
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "MODIFIER_INVALID_STATUS")
    }

    const { option, restaurantId } = await ensureOptionOwnership(optionId, userId, role)

    if (option.status === "DELETED") {
        throw new AppError("Modifier option has been deleted!", 400, "MODIFIER_OPTION_DELETED")
    }

    if (option.status === status) {
        throw new AppError(`Modifier option is already ${status.toLowerCase()}!`, 400, "MODIFIER_OPTION_STATUS_UNCHANGED")
    }

    option.status = status as "ACTIVE" | "INACTIVE"
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

const handleAttachModifierGroupToFood = async (foodId: string, userId: string, role: string, params: FoodModifierGroupAttachParams, session?: mongoose.ClientSession) => {
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

export { handleCreateModifierGroup, handleGetRestaurantModifierGroups, handleAttachModifierGroupToFood, handleUpdateModifierGroupStatus, handleDeleteModifierGroup, handleRestoreModifierGroup, handleUpdateModifierOptionStatus, handleDeleteModifierOption, handleRestoreModifierOption }
