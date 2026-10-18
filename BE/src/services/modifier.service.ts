import mongoose from "mongoose"
import { FoodModifierGroupAttachParams, ModifierGroupCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/AppError"
import ModifierGroup from "../models/modifier_group.model"
import ModifierOption from "../models/modifier_option.model"
import Owner from "../models/owner.model"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import MenuFood from "../models/menu_food.model"
import MenuFoodModifierGroup from "../models/menu_food_modifier_group.model"

const handleCreateModifierGroup = async (restaurantId: string, userId: string, params: ModifierGroupCreateParams, session?: mongoose.ClientSession) => {
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

    const owner = await Owner
        .findOne({ userId })
        .session(session ?? null)

    if (!owner) {
        throw new AppError("Owner account not found!", 404, "MODIFIER_OWNER_NOT_FOUND")
    }

    const restaurant = await Restaurant
        .findOne({ _id: restaurantId, ownerId: owner._id })
        .session(session ?? null)

    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404, "MODIFIER_RESTAURANT_NOT_FOUND")
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

const handleGetRestaurantModifierGroups = async (restaurantId: string, userId: string) => {
    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const owner = await Owner.findOne({ userId })

    if (!owner) {
        throw new AppError("Owner account not found!", 404, "MODIFIER_OWNER_NOT_FOUND")
    }

    const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        ownerId: owner._id
    })

    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404, "MODIFIER_RESTAURANT_NOT_FOUND")
    }

    const groups = await ModifierGroup
        .find({ restaurantId })
        .select("-__v")
        .sort({ createdAt: 1 })
        .lean()

    const groupIds = groups.map(group => group._id)
    const options = await ModifierOption
        .find({ modifierGroupId: { $in: groupIds } })
        .select("-__v")
        .sort({ sortOrder: 1 })
        .lean()

    return groups.map(group => ({
        ...group,
        options: options.filter(option => option.modifierGroupId.toString() === group._id.toString())
    }))
}

const handleAttachModifierGroupToFood = async (foodId: string, userId: string, params: FoodModifierGroupAttachParams, session?: mongoose.ClientSession) => {
    if (!mongoose.isValidObjectId(foodId) || !mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(params?.modifierGroupId)) {
        throw new AppError("Invalid ID format!", 400, "MODIFIER_INVALID_ID")
    }

    const food = await Food.findById(foodId).session(session ?? null)

    if (!food) {
        throw new AppError("Food not found!", 404, "MODIFIER_FOOD_NOT_FOUND")
    }

    const owner = await Owner.findOne({ userId }).session(session ?? null)

    if (!owner) {
        throw new AppError("Owner account not found!", 404, "MODIFIER_OWNER_NOT_FOUND")
    }

    const restaurant = await Restaurant
        .findOne({ _id: food.restaurantId, ownerId: owner._id })
        .session(session ?? null)

    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404, "MODIFIER_RESTAURANT_NOT_FOUND")
    }

    const group = await ModifierGroup
        .findOne({ _id: params.modifierGroupId, restaurantId: food.restaurantId, isActive: true })
        .session(session ?? null)

    if (!group) {
        throw new AppError("Modifier group not found for this restaurant!", 404, "MODIFIER_GROUP_NOT_FOUND")
    }

    const menuFoods = await MenuFood.find({ foodId }).session(session ?? null)

    if (menuFoods.length === 0) {
        throw new AppError("Food is not connected to a menu!", 400, "MODIFIER_FOOD_NOT_IN_MENU")
    }

    const menuFoodIds = menuFoods.map(menuFood => menuFood._id)

    const alreadyAttached = await MenuFoodModifierGroup
        .exists({ menuFoodId: { $in: menuFoodIds }, modifierGroupId: group._id })
        .session(session ?? null)

    if (alreadyAttached) {
        throw new AppError("Modifier group is already attached to this food!", 400, "MODIFIER_GROUP_ALREADY_ATTACHED")
    }

    const modifierLinks = menuFoodIds.map(menuFoodId => ({
        menuFoodId,
        modifierGroupId: group._id
    }))

    if (session) {
        await MenuFoodModifierGroup.create(modifierLinks, { session, ordered: true })
    }
    else {
        const newSession = await mongoose.startSession()
        try {
            await newSession.withTransaction(async () => {
                await MenuFoodModifierGroup.create(modifierLinks, { session: newSession, ordered: true })
            })
        }
        finally {
            await newSession.endSession()
        }
    }

    return { foodId, modifierGroupId: group._id, menuCount: menuFoodIds.length }
}

export { handleCreateModifierGroup, handleGetRestaurantModifierGroups, handleAttachModifierGroupToFood }
