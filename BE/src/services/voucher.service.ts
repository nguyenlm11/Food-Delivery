import mongoose from "mongoose"
import { CreateVoucherParams, VoucherSearchQuery } from "../interfaces/voucher.interface"
import Voucher from "../models/voucher.model"
import Restaurant from "../models/restaurant.model"
import { AppError } from "../errors/AppError"

const handleCreateVoucher = async (id: string, params: CreateVoucherParams) => {
    const { name, description, code, typeVoucher, type, typeDiscount, discountValue, maxDiscount, minPrice = 0, startDate, endDate, startTime = "00:00", endTime = "23:59", maxQuantity, restaurantId } = params

    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_CREATOR_ID")
    }

    if (!name || !name.trim()) {
        throw new AppError("Voucher name is required!", 400, "VOUCHER_NAME_REQUIRED")
    }

    if (!code || !code.trim()) {
        throw new AppError("Voucher code is required!", 400, "VOUCHER_CODE_REQUIRED")
    }

    if (!["SYSTEM", "RESTAURANT"].includes(typeVoucher)) {
        throw new AppError("Invalid voucher type!", 400, "VOUCHER_INVALID_TYPE")
    }

    if (!["FOOD", "SHIP"].includes(type)) {
        throw new AppError("Invalid voucher category!", 400, "VOUCHER_INVALID_CATEGORY")
    }

    if (!["AMOUNT", "PERCENT"].includes(typeDiscount)) {
        throw new AppError("Invalid discount type!", 400, "VOUCHER_INVALID_DISCOUNT_TYPE")
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
        throw new AppError("Discount value must be greater than 0!", 400, "VOUCHER_INVALID_DISCOUNT_VALUE")
    }

    if (typeDiscount === "PERCENT" && discountValue > 100) {
        throw new AppError("Percentage discount cannot exceed 100!", 400, "VOUCHER_INVALID_DISCOUNT_PERCENT")
    }

    if (maxDiscount !== undefined && maxDiscount !== null) {
        if (!Number.isFinite(maxDiscount) || maxDiscount < 0) {
            throw new AppError("Max discount must be 0 or greater!", 400, "VOUCHER_INVALID_MAX_DISCOUNT")
        }
    }

    if (!Number.isFinite(minPrice) || minPrice < 0) {
        throw new AppError("Minimum price must be 0 or greater!", 400, "VOUCHER_INVALID_MIN_PRICE")
    }

    if (!startDate || !endDate) {
        throw new AppError("Start date and end date are required!", 400, "VOUCHER_DATES_REQUIRED")
    }

    const parsedStartDate = new Date(startDate)
    const parsedEndDate = new Date(endDate)

    if (
        Number.isNaN(parsedStartDate.getTime()) ||
        Number.isNaN(parsedEndDate.getTime())
    ) {
        throw new AppError("Invalid voucher date!", 400, "VOUCHER_INVALID_DATE")
    }

    if (parsedEndDate < parsedStartDate) {
        throw new AppError("End date cannot be before start date!", 400, "VOUCHER_INVALID_DATE_RANGE")
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

    if (!timeRegex.test(startTime)) {
        throw new AppError("Invalid start time format! Use HH:mm.", 400, "VOUCHER_INVALID_START_TIME")
    }

    if (!timeRegex.test(endTime)) {
        throw new AppError("Invalid end time format! Use HH:mm.", 400, "VOUCHER_INVALID_END_TIME")
    }

    if (
        parsedStartDate.getTime() === parsedEndDate.getTime() &&
        endTime < startTime
    ) {
        throw new AppError("End time cannot be before start time on the same date!", 400, "VOUCHER_INVALID_TIME_RANGE")
    }

    if (maxQuantity !== undefined && maxQuantity !== null) {
        if (!Number.isInteger(maxQuantity) || maxQuantity < 1) {
            throw new AppError("Max quantity must be an integer greater than 0!", 400, "VOUCHER_INVALID_MAX_QUANTITY")
        }
    }

    const normalizedCode = code.trim().toUpperCase()

    const existingVoucher = await Voucher.findOne({ code: normalizedCode }).lean()

    if (existingVoucher) {
        throw new AppError("Voucher code already exists!", 409, "VOUCHER_CODE_ALREADY_EXISTS")
    }

    let normalizedRestaurantId: mongoose.Types.ObjectId | null = null

    if (typeVoucher === "SYSTEM") {
        if (restaurantId) {
            throw new AppError("System voucher cannot belong to a restaurant!", 400, "VOUCHER_SYSTEM_RESTAURANT_NOT_ALLOWED")
        }
    } else {
        if (!restaurantId || !mongoose.isValidObjectId(restaurantId)) {
            throw new AppError("A valid restaurant ID is required for restaurant vouchers!", 400, "VOUCHER_INVALID_RESTAURANT_ID")
        }

        const restaurant = await Restaurant.findById(restaurantId).select("_id").lean()

        if (!restaurant) {
            throw new AppError("Restaurant not found!", 404, "VOUCHER_RESTAURANT_NOT_FOUND")
        }

        normalizedRestaurantId = new mongoose.Types.ObjectId(restaurantId)
    }

    const voucher = await Voucher.create({
        name: name.trim(),
        description: description?.trim() ?? "",
        code: normalizedCode,
        typeVoucher,
        type,
        typeDiscount,
        discountValue,
        maxDiscount: maxDiscount ?? null,
        minPrice,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        startTime,
        endTime,
        maxQuantity: maxQuantity ?? null,
        usedQuantity: 0,
        restaurantId: normalizedRestaurantId,
        createdBy: new mongoose.Types.ObjectId(id)
    })

    return voucher
}

const handleGetAllVouchers = async (query: VoucherSearchQuery) => {
    const page = query.page === undefined ? 1 : Number(query.page)
    const requestedLimit = query.limit === undefined ? 10 : Number(query.limit)

    if (!Number.isInteger(page) || page < 1) {
        throw new AppError("Page must be a positive integer!", 400, "VOUCHER_INVALID_PAGE")
    }
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
        throw new AppError("Limit must be a positive integer!", 400, "VOUCHER_INVALID_LIMIT")
    }

    const limit = Math.min(100, requestedLimit)
    const skip = (page - 1) * limit
    const sortOrder = query.sortOrder === "asc" ? 1 : -1
    const allowedSortFields = ["createdAt", "updatedAt", "name", "code", "startDate", "endDate", "status"]
    const sortBy = allowedSortFields.includes(query.sortBy ?? "") ? query.sortBy! : "createdAt"
    const filter: Record<string, any> = {}

    const search = typeof query.search === "string" ? query.search.trim() : ""
    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        filter.$or = [
            { name: { $regex: escapedSearch, $options: "i" } },
            { code: { $regex: escapedSearch, $options: "i" } },
        ]
    }

    if (query.typeVoucher !== undefined) {
        if (!["SYSTEM", "RESTAURANT"].includes(query.typeVoucher)) {
            throw new AppError("Invalid voucher type!", 400, "VOUCHER_INVALID_TYPE")
        }
        filter.typeVoucher = query.typeVoucher
    }
    if (query.type !== undefined) {
        if (!["FOOD", "SHIP"].includes(query.type)) {
            throw new AppError("Invalid voucher category!", 400, "VOUCHER_INVALID_CATEGORY")
        }
        filter.type = query.type
    }
    if (query.typeDiscount !== undefined) {
        if (!["AMOUNT", "PERCENT"].includes(query.typeDiscount)) {
            throw new AppError("Invalid discount type!", 400, "VOUCHER_INVALID_DISCOUNT_TYPE")
        }
        filter.typeDiscount = query.typeDiscount
    }
    if (query.status !== undefined) {
        if (!["ACTIVE", "INACTIVE"].includes(query.status)) {
            throw new AppError("Invalid voucher status!", 400, "VOUCHER_INVALID_STATUS")
        }
        filter.status = query.status
    }

    if (query.restaurantId) {
        if (!mongoose.isValidObjectId(query.restaurantId)) {
            throw new AppError("Invalid restaurant ID format!", 400, "VOUCHER_INVALID_RESTAURANT_ID")
        }
        filter.restaurantId = new mongoose.Types.ObjectId(query.restaurantId)
    }

    const [vouchers, total] = await Promise.all([
        Voucher.find(filter)
            .populate("restaurantId", "name")
            .populate("createdBy", "fullname email")
            .sort({ [sortBy]: sortOrder, _id: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),

        Voucher.countDocuments(filter),
    ])

    return {
        vouchers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export { handleCreateVoucher, handleGetAllVouchers }
