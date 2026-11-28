import mongoose from "mongoose"
import { CreateCartBody } from "../interfaces/cart.interface"
import { AppError } from "../errors/AppError"
import { Restaurant } from "../models/restaurant.model"
import { Food } from "../models/food.model"
import { Cart, CartItem, CartItemOption } from "../models/cart.model"
import { Menu } from "../models/menu.model"
import { FoodModifierGroup, ModifierGroup, ModifierOption } from "../models/modifier.model"
import { roundAmount } from "../utils/helper"

const recalculateCart = async (cart: any, session: mongoose.ClientSession) => {
    const items = await CartItem.find({ cartId: cart._id }).populate("foodId").session(session)
    const options = await CartItemOption.find({ cartItemId: { $in: items.map(item => item._id) } }).session(session).lean()

    let totalItemCount = 0
    let totalPrice = 0

    for (const item of items) {
        const food: any = item.foodId

        if (food && item.price !== food.platformPrice) {
            item.price = food.platformPrice
            await item.save({ session })
        }

        const itemOptions = options.filter(option => option.cartItemId.equals(item._id))
        const unitPrice = roundAmount(itemOptions.reduce((sum, option) => sum + option.priceAdjustment, 0))
        totalItemCount += item.quantity
        totalPrice += roundAmount((item.price + unitPrice) * item.quantity)
    }

    cart.totalItemCount = totalItemCount
    cart.totalPrice = roundAmount(totalPrice)
    await cart.save({ session })

    return { items, options }
}

const handleAddCartItem = async (userId: string, resId: string, params: CreateCartBody) => {
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

            const requestedFoodIds = params.items
                .map(item => item.foodId.toString())
                .filter((id, index, all) => all.indexOf(id) === index)

            const foods = await Food.find({ _id: { $in: requestedFoodIds }, restaurantId: resId, status: "ACTIVE" }).session(session)

            if (foods.length !== requestedFoodIds.length) {
                throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400, "CART_FOOD_UNAVAILABLE")
            }

            if (foods.some(food => !food.menuId)) {
                throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400, "CART_FOOD_UNAVAILABLE")
            }

            const foodMenuIds = foods
                .map(food => food.menuId.toString())
                .filter((id, index, all) => all.indexOf(id) === index)

            const menus = await Menu.find({ _id: { $in: foodMenuIds }, restaurantId: resId }).select("_id").session(session).lean()

            if (menus.length !== foodMenuIds.length) {
                throw new AppError("Some foods are unavailable or don't belong to this restaurant!", 400, "CART_FOOD_UNAVAILABLE")
            }

            const modifierLinks = await FoodModifierGroup.find({ foodId: { $in: requestedFoodIds } }).session(session).lean()

            const attachedGroupIds = modifierLinks
                .map(link => link.modifierGroupId.toString())
                .filter((id, index, all) => all.indexOf(id) === index)

            const groups = await ModifierGroup.find({ _id: { $in: attachedGroupIds } }).session(session).lean()

            const requestedOptionIds = params.items.flatMap(item => item.modifierOptionIds ?? [])
            const options = await ModifierOption.find({ _id: { $in: requestedOptionIds } }).session(session).lean()

            let cart = await Cart.findOne({ userId, restaurantId: resId }).session(session)

            if (!cart) {
                const [newCart] = await Cart.create([{ userId, restaurantId: resId }], { session })
                cart = newCart
            }

            const affectedCartItemIds: mongoose.Types.ObjectId[] = []

            for (const item of params.items) {
                const foodId = item.foodId.toString()
                const food = foods.find(f => f._id.toString() === foodId)

                if (!food) {
                    throw new AppError("Food not found!", 404, "CART_FOOD_UNAVAILABLE")
                }

                const foodGroups = modifierLinks
                    .filter(link => link.foodId.toString() === foodId)
                    .map(link => groups.find(group => group._id.toString() === link.modifierGroupId.toString()))
                    .filter((group): group is NonNullable<typeof group> => Boolean(group))

                const selectedOptionIds = (item.modifierOptionIds ?? []).map(optionId => optionId.toString()).sort()
                const hasDuplicate = selectedOptionIds.some((optionId, index) => selectedOptionIds.indexOf(optionId) !== index)

                if (hasDuplicate) {
                    throw new AppError("Modifier options cannot be selected more than once!", 400, "CART_DUPLICATE_MODIFIER_OPTIONS")
                }

                const selectedOptions: {
                    modifierOptionId: mongoose.Types.ObjectId
                    groupId: string
                    groupName: string
                    optionName: string
                    priceAdjustment: number
                }[] = []

                for (const optionId of selectedOptionIds) {
                    const option = options.find(o => o._id.toString() === optionId)

                    if (!option || option.status !== "ACTIVE") {
                        throw new AppError("One or more modifier options are unavailable!", 400, "CART_MODIFIER_OPTION_UNAVAILABLE")
                    }

                    const groupId = option.modifierGroupId.toString()
                    const group = foodGroups.find(g => g._id.toString() === groupId)

                    if (!group || group.status !== "ACTIVE") {
                        throw new AppError("Modifier option does not belong to this food!", 400, "CART_MODIFIER_OPTION_NOT_ALLOWED")
                    }

                    selectedOptions.push({
                        modifierOptionId: option._id,
                        groupId,
                        groupName: group.name,
                        optionName: option.name,
                        priceAdjustment: option.priceAdjustment
                    })
                }

                for (const group of foodGroups) {
                    if (group.status !== "ACTIVE") continue

                    const groupId = group._id.toString()
                    const selectedCount = selectedOptions.filter(option => option.groupId === groupId).length

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
                    affectedCartItemIds.push(cartItem._id)
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
                affectedCartItemIds.push(newCartItem._id)

                if (selectedOptions.length > 0) {
                    await CartItemOption.create(
                        selectedOptions.map(({ modifierOptionId, groupName, optionName, priceAdjustment }) => ({
                            cartItemId: newCartItem._id,
                            modifierOptionId,
                            groupName,
                            optionName,
                            priceAdjustment
                        })),
                        { session, ordered: true }
                    )
                }
            }

            const { items: cartItems, options: cartItemOptions } = await recalculateCart(cart, session)

            const responseItems = cartItems
                .filter(item => affectedCartItemIds.some(affectedId => affectedId.equals(item._id)))
                .map(item => {
                    const itemOptions = cartItemOptions.filter(option => option.cartItemId.equals(item._id))
                    const unitPrice = roundAmount(itemOptions.reduce((sum, option) => sum + option.priceAdjustment, 0))
                    return {
                        ...item.toObject(),
                        unitPrice,
                        totalPrice: roundAmount((item.price + unitPrice) * item.quantity)
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

            const { options } = await recalculateCart(cart, session)

            const cartItems = await CartItem.find({ cartId: cart._id })
                .populate("foodId")
                .select("-optionsKey")
                .session(session)
                .lean()

            const responseItems = cartItems.map(item => {
                const itemOptions = options.filter(option => option.cartItemId.equals(item._id))
                const unitPrice = roundAmount(itemOptions.reduce((sum, option) => sum + option.priceAdjustment, 0))
                return {
                    ...item,
                    unitPrice,
                    totalPrice: roundAmount((item.price + unitPrice) * item.quantity),
                    options: itemOptions
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

    const item = await CartItem.findById(itemId).populate("foodId").lean()

    if (!item) {
        throw new AppError("Item not found!", 404, "CART_ITEM_NOT_FOUND")
    }

    const cart = await Cart.findOne({ _id: item.cartId, userId }).select("_id").lean()

    if (!cart) {
        throw new AppError("Item not found!", 404, "CART_ITEM_NOT_FOUND")
    }

    const options = await CartItemOption.find({ cartItemId: item._id }).lean()

    const unitPrice = roundAmount(options.reduce((sum, option) => sum + option.priceAdjustment, 0))
    const currentPrice = (item?.foodId as any)?.platformPrice

    return {
        ...item,
        price: currentPrice,
        options,
        unitPrice,
        totalPrice: roundAmount((currentPrice + unitPrice) * item.quantity)
    }
}

const handleRemoveCartItem = async (itemId: string, userId: string) => {
    if (!mongoose.isValidObjectId(itemId) || !mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "CART_INVALID_ID")
    }

    const session = await mongoose.startSession()
    let restaurantId = ""

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

            restaurantId = cart.restaurantId.toString()

            await CartItemOption.deleteMany({ cartItemId: item._id }, { session })
            await item.deleteOne({ session })
            await recalculateCart(cart, session)
        })
    }
    finally {
        await session.endSession()
    }

    return {
        itemId,
        restaurantId
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

    return {
        restaurantId: resId
    }
}

export { handleAddCartItem, handleGetCart, handleGetCartItemById, handleRemoveCartItem, handleClearCart }