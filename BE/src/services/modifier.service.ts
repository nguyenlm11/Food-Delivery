import mongoose from "mongoose"
import { FoodModifierGroupAttachParams, ModifierGroupCreateParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import ModifierGroup from "../models/modifier_group.model"
import ModifierOption from "../models/modifier_option.model"
import Owner from "../models/owner.model"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import MenuFood from "../models/menu_food.model"
import MenuFoodModifierGroup from "../models/menu_food_modifier_group.model"

const handleCreateModifierGroup = async (restaurantId: string, userId: string, params: ModifierGroupCreateParams) => {
    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    if (!params || !params.name?.trim() || !Array.isArray(params.options) || params.options.length === 0) {
        throw new AppError("Group name and at least one option are required!", 400)
    }

    const optionNames = new Set<string>()
    for (const option of params.options) {
        if (!option?.name?.trim() || !Number.isFinite(option.priceAdjustment)) {
            throw new AppError("Each option needs a name and a valid price adjustment!", 400)
        }

        const optionName = option.name.trim().toLowerCase()
        if (optionNames.has(optionName)) {
            throw new AppError("Option names must be unique!", 400)
        }
        optionNames.add(optionName)
    }

    const owner = await Owner
        .findOne({ userId })
        .select("_id")

    if (!owner) {
        throw new AppError("Owner account not found!", 404)
    }

    const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        ownerId: owner._id
    })

    if (!restaurant) {
        throw new AppError("Restaurant not found or unauthorized!", 404)
    }

    const groupName = params.name.trim()
    const existingGroup = await ModifierGroup.findOne({
        restaurantId,
        name: groupName
    })

    if (existingGroup) {
        throw new AppError("Modifier group name already exists in this restaurant!", 400)
    }

    const session = await mongoose.startSession()
    let modifierGroupId: mongoose.Types.ObjectId | null = null

    try {
        await session.withTransaction(async () => {
            const [group] = await ModifierGroup.create([{
                restaurantId,
                name: groupName
            }], { session })

            await ModifierOption.create(
                params.options.map((option, index) => ({
                    modifierGroupId: group._id,
                    name: option.name.trim(),
                    priceAdjustment: option.priceAdjustment,
                    sortOrder: index
                })),
                { session }
            )

            modifierGroupId = group._id
        })
    }
    finally {
        await session.endSession()
    }

    return { modifierGroupId }
}

const handleGetRestaurantModifierGroups = async (restaurantId: string, userId: string) => {
    if (!mongoose.isValidObjectId(restaurantId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    const owner = await Owner.findOne({ userId })

    if (!owner) {
        throw new AppError("Owner account not found!", 404)
    }

    const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        ownerId: owner._id
    })

    if (!restaurant) {
        throw new AppError("Restaurant not found or unauthorized!", 404)
    }

    const groups = await ModifierGroup
        .find({ restaurantId })
        .select("-__v")
        .sort({ createdAt: 1 })
        .lean()

    // if (groups.length === 0) {
    //     return []
    // }

    const groupIds = groups.map(group => group._id)
    const options = await ModifierOption
        .find({ modifierGroupId: { $in: groupIds } })
        .select("-__v")
        .sort({ sortOrder: 1 })
        .lean()

    return groups.map(group => ({
        ...group,
        options: options.filter(option =>
            option.modifierGroupId === group._id
        )
    }))
}

const handleAttachModifierGroupToFood = async (foodId: string, userId: string, params: FoodModifierGroupAttachParams) => {
    if (!mongoose.isValidObjectId(foodId) || !mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(params?.modifierGroupId)) {
        throw new AppError("Invalid ID format!", 400)
    }

    if (params.minSelect < 0 || params.maxSelect < 1 || params.minSelect > params.maxSelect) {
        throw new AppError("Selection limits are invalid!", 400)
    }

    const food = await Food.findById(foodId)

    if (!food) {
        throw new AppError("Food not found!", 404)
    }

    const owner = await Owner.findOne({ userId })

    if (!owner) {
        throw new AppError("Owner account not found!", 404)
    }

    const restaurant = await Restaurant.findOne({
        _id: food.restaurantId,
        ownerId: owner._id
    })

    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404)
    }

    const group = await ModifierGroup.findOne({
        _id: params.modifierGroupId,
        restaurantId: food.restaurantId,
        isActive: true
    })

    if (!group) {
        throw new AppError("Modifier group not found for this restaurant!", 404)
    }

    const menuFoods = await MenuFood.find({ foodId })

    if (menuFoods.length === 0) {
        throw new AppError("Food is not connected to a menu!", 400)
    }

    const menuFoodIds = menuFoods.map(menuFood => menuFood._id)

    const alreadyAttached = await MenuFoodModifierGroup.exists({
        menuFoodId: { $in: menuFoodIds },
        modifierGroupId: group._id
    })

    if (alreadyAttached) {
        throw new AppError("Modifier group is already attached to this food!", 400)
    }

    const optionCount = await ModifierOption.countDocuments({
        modifierGroupId: group._id,
        isAvailable: true
    })

    if (params.minSelect > optionCount || params.maxSelect > optionCount) {
        throw new AppError("Selection limit is greater than available options!", 400)
    }

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            await MenuFoodModifierGroup.insertMany(
                menuFoodIds.map(menuFoodId => ({
                    menuFoodId,
                    modifierGroupId: group._id,
                    minSelect: params.minSelect,
                    maxSelect: params.maxSelect
                })),
                { session }
            )
        })
    }
    finally {
        await session.endSession()
    }

    return { foodId, modifierGroupId: group._id, menuCount: menuFoodIds.length }
}

export { handleCreateModifierGroup, handleGetRestaurantModifierGroups, handleAttachModifierGroupToFood }
