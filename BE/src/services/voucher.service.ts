import mongoose from "mongoose"
import Voucher from "../models/voucher.model"
import Restaurant from "../models/restaurant.model"
import { AppError } from "../errors/AppError"
import { CreateVoucherParams, VoucherSearchQuery } from "../interfaces/voucher.interface"

const toDateOnlyString = (value: string | Date) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return isValidDateOnlyString(value) ? value : null
    }

    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

const isValidDateOnlyString = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

    const [year, month, day] = value.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day
}

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

    const normalizedStartDate = toDateOnlyString(startDate)
    const normalizedEndDate = toDateOnlyString(endDate)

    if (!normalizedStartDate || !normalizedEndDate) {
        throw new AppError("Invalid voucher date!", 400, "VOUCHER_INVALID_DATE")
    }

    if (normalizedEndDate < normalizedStartDate) {
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
        normalizedStartDate === normalizedEndDate &&
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
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
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

    if (query.date !== undefined) {
        const dateStr = typeof query.date === "string"
            ? query.date
            : query.date.toISOString().slice(0, 10)

        if (!isValidDateOnlyString(dateStr)) {
            throw new AppError("Invalid filter date! Use YYYY-MM-DD.", 400, "VOUCHER_INVALID_FILTER_DATE")
        }

        const [year, month, day] = dateStr.split("-").map(Number)
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
        const startOfNextDay = new Date(Date.UTC(year, month - 1, day + 1))
        const startDateValue = {
            $convert: { input: "$startDate", to: "date", onError: null, onNull: null }
        }
        const endDateValue = {
            $convert: { input: "$endDate", to: "date", onError: null, onNull: null }
        }

        filter.$expr = {
            $and: [
                { $ne: [startDateValue, null] },
                { $ne: [endDateValue, null] },
                { $lt: [startDateValue, startOfNextDay] },
                { $gte: [endDateValue, startOfDay] }
            ]
        }
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

const handleUpdateVoucherStatus = async (voucherId: string, status: string) => {
    if (!mongoose.isValidObjectId(voucherId)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_ID")
    }

    const voucher = await Voucher.findById(voucherId)
    const validStatuses = ["ACTIVE", "INACTIVE"]

    if (!voucher) {
        throw new AppError("Voucher not found!", 404, "VOUCHER_NOT_FOUND")
    }

    if (!validStatuses.includes(status)) {
        throw new AppError("Status incorrect format!", 400, "VOUCHER_INVALID_STATUS")
    }

    if (voucher.status === status) {
        throw new AppError(`Voucher is already ${status.toLowerCase()}!`, 400, "VOUCHER_STATUS_UNCHANGED")
    }

    const voucherEndInstant = new Date(`${voucher.endDate}T${voucher.endTime}:59+07:00`)
    if (voucherEndInstant < new Date()) {
        throw new AppError("Voucher is expired!", 400, "VOUCHER_EXPIRED")
    }

    voucher.status = status as "ACTIVE" | "INACTIVE"

    await voucher.save()

    return {
        voucherId: voucher._id,
        status: voucher.status
    }
}

export { handleCreateVoucher, handleGetAllVouchers, handleUpdateVoucherStatus }
