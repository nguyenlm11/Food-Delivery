import mongoose from "mongoose"
import { CartCreateParams } from "../interfaces/cart.interface"
import { AppError } from "../errors/AppError"
import Restaurant from "../models/restaurant.model"
import Food from "../models/food.model"
import Cart from "../models/cart.model"
import CartItem from "../models/cart_item.model"
import CartItemOption from "../models/cart_item_option.model"
import Menu from "../models/menu.model"
import FoodModifierGroup from "../models/food_modifier_group.model"
import ModifierGroup from "../models/modifier_group.model"
import ModifierOption from "../models/modifier_option.model"

const getOptionPricesByItem = async (itemIds: mongoose.Types.ObjectId[], session: mongoose.ClientSession) => {
    const options = await CartItemOption.find({ cartItemId: { $in: itemIds } }).session(session).lean()
    const optionPrices = new Map<string, number>()

    for (const option of options) {
        const itemId = option.cartItemId.toString()
        optionPrices.set(itemId, (optionPrices.get(itemId) ?? 0) + option.priceAdjustment)
    }

    return optionPrices
}

const recalculateCart = async (cart: any, session: mongoose.ClientSession) => {
    const items = await CartItem.find({ cartId: cart._id }).populate("foodId").session(session)
    const optionPrices = await getOptionPricesByItem(items.map(item => item._id), session)

    let totalItemCount = 0
    let totalPrice = 0

    for (const item of items) {
        const food = item.foodId as any

        if (food && item.price !== food.platformPrice) {
            item.price = food.platformPrice
            await item.save({ session })
        }

        const unitPrice = optionPrices.get(item._id.toString()) ?? 0
        totalItemCount += item.quantity
        totalPrice += (item.price + unitPrice) * item.quantity
    }

    cart.totalItemCount = totalItemCount
    cart.totalPrice = totalPrice
    await cart.save({ session })
}

const handleAddCartItem = async (userId: string, resId: string, params: CartCreateParams) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400, "CART_INVALID_ID")
    }

    if (!params || !Array.isArray(params.items) || params.items.length === 0) {
        throw new AppError("Items list cannot be empty!", 400, "CART_ITEMS_REQUIRED")
    }

    for (const item of params.items) {
        if (!mongoose.isValidObjectId(item.foodId)) {
            throw new AppError("One or more Food IDs are invalid!", 400, "CART_INVALID_FOOD_ID")
        }
        if (item.quantity <= 0) {
            throw new AppError("Quantity must be a positive integer!", 400, "CART_INVALID_QUANTITY")
        }
        if (item.modifierOptionIds?.some(id => !mongoose.isValidObjectId(id))) {
            throw new AppError("Modifier option IDs are invalid!", 400, "CART_INVALID_MODIFIER_OPTION_ID")
        }
    }

    const session = await mongoose.startSession()
    try {
        const response = await session.withTransaction(async () => {
            const restaurant = await Restaurant.exists({ _id: resId }).session(session)

            if (!restaurant) {
                throw new AppError("Restaurant not found!", 404, "CART_RESTAURANT_NOT_FOUND")
            }

            const requestedFoodIds = [...new Set(params.items.map(item => item.foodId.toString()))]
            const foods = await Food.find({ _id: { $in: requestedFoodIds }, restaurantId: resId, status: "ACTIVE" }).session(session)

            if (foods.length !== requestedFoodIds.length) {
                throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400, "CART_FOOD_UNAVAILABLE")
            }

            const foodsById = new Map(foods.map(food => [food._id.toString(), food]))

            if (foods.some(food => !food.menuId)) {
                throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400, "CART_FOOD_UNAVAILABLE")
            }

            const foodMenuIds = [...new Set(foods.map(food => food.menuId.toString()))]
            const menus = await Menu.find({ _id: { $in: foodMenuIds }, restaurantId: resId }).select("_id").session(session).lean()

            if (menus.length !== foodMenuIds.length) {
                throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400, "CART_FOOD_UNAVAILABLE")
            }

            const modifierLinks = await FoodModifierGroup.find({ foodId: { $in: requestedFoodIds } }).session(session).lean()
            const attachedGroupIds = [...new Set(modifierLinks.map(link => link.modifierGroupId.toString()))]
            const groups = await ModifierGroup.find({ _id: { $in: attachedGroupIds } }).session(session).lean()
            const groupsById = new Map(groups.map(group => [group._id.toString(), group]))
            const modifierGroupsByFood = new Map<string, Map<string, (typeof groups)[number]>>()

            modifierLinks.forEach(link => {
                const foodId = link.foodId.toString()
                const group = groupsById.get(link.modifierGroupId.toString())

                if (!group) return

                const foodGroups = modifierGroupsByFood.get(foodId) ?? new Map<string, (typeof groups)[number]>()
                foodGroups.set(group._id.toString(), group)
                modifierGroupsByFood.set(foodId, foodGroups)
            })

            const requestedOptionIds = new Set(params.items.flatMap(item => item.modifierOptionIds ?? []))
            const options = await ModifierOption.find({ _id: { $in: [...requestedOptionIds] } }).session(session).lean()
            const optionsById = new Map(options.map(option => [option._id.toString(), option]))

            let cart = await Cart.findOne({ userId, restaurantId: resId }).session(session)

            if (!cart) {
                const [newCart] = await Cart.create([{ userId, restaurantId: resId }], { session })
                cart = newCart
            }

            const affectedCartItemIds = new Set<mongoose.Types.ObjectId>()

            for (const item of params.items) {
                const foodId = item.foodId.toString()
                const food = foodsById.get(foodId)

                if (!food) {
                    throw new AppError("Food not found!", 404, "CART_FOOD_UNAVAILABLE")
                }

                const foodGroupsById = modifierGroupsByFood.get(foodId)
                const selectedOptionIds = (item.modifierOptionIds ?? []).map(optionId => optionId.toString()).sort()
                const uniqueOptionIds = new Set(selectedOptionIds)

                if (uniqueOptionIds.size !== selectedOptionIds.length) {
                    throw new AppError("Modifier options cannot be selected more than once!", 400, "CART_DUPLICATE_MODIFIER_OPTIONS")
                }

                const selectedCounts = new Map<string, number>()
                const selectedOptions: { modifierOptionId: mongoose.Types.ObjectId; groupName: string; optionName: string; priceAdjustment: number }[] = []

                for (const optionId of selectedOptionIds) {
                    const option = optionsById.get(optionId)

                    if (!option || option.status !== "ACTIVE") {
                        throw new AppError("One or more modifier options are unavailable!", 400, "CART_MODIFIER_OPTION_UNAVAILABLE")
                    }

                    const groupId = option.modifierGroupId.toString()
                    const group = foodGroupsById?.get(groupId)

                    if (!group || group.status !== "ACTIVE") {
                        throw new AppError("Modifier option does not belong to this food!", 400, "CART_MODIFIER_OPTION_NOT_ALLOWED")
                    }

                    selectedCounts.set(groupId, (selectedCounts.get(groupId) ?? 0) + 1)
                    selectedOptions.push({
                        modifierOptionId: option._id,
                        groupName: group.name,
                        optionName: option.name,
                        priceAdjustment: option.priceAdjustment
                    })
                }

                for (const group of foodGroupsById?.values() ?? []) {
                    if (group.status !== "ACTIVE") continue

                    const groupId = group._id.toString()
                    const selectedCount = selectedCounts.get(groupId) ?? 0

                    if (selectedCount < group.minSelect || selectedCount > group.maxSelect) {
                        throw new AppError(`Select between ${group.minSelect} and ${group.maxSelect} options for ${group.name}!`, 400, "CART_MODIFIER_SELECTION_INVALID")
                    }
                }

                const optionsKey = selectedOptionIds.join(",")
                const cartItem = await CartItem.findOne({ cartId: cart._id, foodId, optionsKey }).session(session)

                if (cartItem) {
                    cartItem.quantity += item.quantity
                    cartItem.price = food.platformPrice
                    await cartItem.save({ session })
                    affectedCartItemIds.add(cartItem._id)
                    continue
                }

                const newCartItem = new CartItem({
                    cartId: cart._id,
                    foodId,
                    quantity: item.quantity,
                    price: food.platformPrice,
                    optionsKey
                })

                await newCartItem.save({ session })
                affectedCartItemIds.add(newCartItem._id)

                if (selectedOptions.length > 0) {
                    await CartItemOption.create(
                        selectedOptions.map(option => ({ cartItemId: newCartItem._id, ...option })),
                        { session, ordered: true }
                    )
                }
            }

            await recalculateCart(cart, session)

            const itemIds = [...affectedCartItemIds]
            const items = await CartItem.find({ _id: { $in: itemIds } })
                .populate("foodId")
                .session(session)
                .lean()

            const optionPrices = await getOptionPricesByItem(itemIds, session)

            const responseItems = items.map(item => {
                const unitPrice = optionPrices.get(item._id.toString()) ?? 0
                return {
                    ...item,
                    unitPrice,
                    totalPrice: (item.price + unitPrice) * item.quantity
                }
            })
            return { items: responseItems }
        })

        return response
    }
    finally {
        await session.endSession()
    }
}

const handleGetCart = async (userId: string, resId: string) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400, "CART_INVALID_ID")
    }

    const session = await mongoose.startSession()
    try {
        const response = await session.withTransaction(async () => {
            const cart = await Cart.findOne({ userId, restaurantId: resId }).session(session)

            if (!cart) {
                throw new AppError("Cart not found!", 404, "CART_NOT_FOUND")
            }

            await recalculateCart(cart, session)

            const cartItems = await CartItem.find({ cartId: cart._id })
                .session(session)
                .lean()

            const itemIds = cartItems.map(item => item._id)
            const items = await CartItem.find({ _id: { $in: itemIds } })
                .populate("foodId")
                .select("-optionsKey")
                .session(session)
                .lean()

            const optionPrices = await getOptionPricesByItem(itemIds, session)

            const responseItems = items.map(item => {
                const unitPrice = optionPrices.get(item._id.toString()) ?? 0
                return {
                    ...item,
                    unitPrice,
                    totalPrice: (item.price + unitPrice) * item.quantity
                }
            })
            return {
                ...cart.toObject(),
                items: responseItems
            }
        })

        return response
    }
    finally {
        await session.endSession()
    }
}

const handleGetCartItemById = async (userId: string, itemId: string) => {
    if (!mongoose.isValidObjectId(itemId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "CART_INVALID_ID")
    }

    const item = await CartItem
        .findById(itemId)
        .populate("foodId")
        .lean()

    if (!item) {
        throw new AppError("Item not found!", 404, "CART_ITEM_NOT_FOUND")
    }

    const cart = await Cart.exists({ _id: item.cartId, userId })

    if (!cart) {
        throw new AppError("Item not found!", 404, "CART_ITEM_NOT_FOUND")
    }

    const options = await CartItemOption
        .find({ cartItemId: item._id })
        .lean()

    const unitPrice = options.reduce((sum, option) => sum + option.priceAdjustment, 0)
    const currentPrice = (item?.foodId as any)?.platformPrice

    return {
        ...item,
        price: currentPrice,
        options,
        unitPrice,
        totalPrice: (currentPrice + unitPrice) * item.quantity
    }
}

const handleRemoveCartItem = async (itemId: string, userId: string) => {
    if (!mongoose.isValidObjectId(itemId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "CART_INVALID_ID")
    }

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const item = await CartItem.findById(itemId).session(session)

            if (!item) {
                throw new AppError("Item not found!", 404, "CART_ITEM_NOT_FOUND")
            }

            const cart = await Cart.findOne({ _id: item.cartId, userId }).session(session)

            if (!cart) {
                throw new AppError("Item not found!", 404, "CART_ITEM_NOT_FOUND")
            }

            await CartItemOption.deleteMany({ cartItemId: item._id }, { session })
            await item.deleteOne({ session })
            await recalculateCart(cart, session)
        })
    }
    finally {
        await session.endSession()
    }
}

const handleClearCart = async (userId: string, resId: string) => {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(resId)) {
        throw new AppError("Invalid ID format!", 400, "CART_INVALID_ID")
    }

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ userId, restaurantId: resId }).session(session)

            if (!cart) {
                throw new AppError("Cart not found!", 404, "CART_NOT_FOUND")
            }

            const items = await CartItem.find({ cartId: cart._id }).session(session)
            const itemIds = items.map(item => item._id)

            await CartItemOption.deleteMany({ cartItemId: { $in: itemIds } }, { session })
            await CartItem.deleteMany({ cartId: cart._id }, { session })
            await cart.deleteOne({ session })
        })
    }
    finally {
        await session.endSession()
    }
}

export { handleAddCartItem, handleGetCart, handleGetCartItemById, handleRemoveCartItem, handleClearCart }