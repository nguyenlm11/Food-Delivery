import mongoose from "mongoose"
import Voucher from "../models/voucher.model"
import Restaurant from "../models/restaurant.model"
import Owner from "../models/owner.model"
import { AppError } from "../errors/AppError"
import { CreateVoucherBody, UpdateVoucherBody, GetVouchersQuery } from "../interfaces/voucher.interface"
import { ensureRestaurantAccess } from "./restaurant.service"
import { dateToDateOnly, isValidDateOnly } from "../utils/date.util"
import { resolveSortField, resolveSortOrder } from "../utils/sort.util"

const ensureVoucherAccess = async (voucher: any, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }
    if (role === "ADMIN") return
    if (role !== "OWNER" || voucher.typeVoucher !== "RESTAURANT" || !voucher.restaurantId) {
        throw new AppError("You don't have permission to modify this voucher!", 403, "VOUCHER_ACCESS_FORBIDDEN")
    }

    await ensureRestaurantAccess(voucher.restaurantId.toString(), userId, role, "VOUCHER_ACCESS_FORBIDDEN")
}

const handleCreateVoucher = async (id: string, role: string, params: CreateVoucherBody) => {
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

    if (description !== undefined && typeof description !== "string") {
        throw new AppError("Voucher description must be a string!", 400, "VOUCHER_INVALID_DESCRIPTION")
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

    // Chuẩn hoá về "YYYY-MM-DD". Ngày không tồn tại (vd 2025-02-30) bị từ chối.
    let normalizedStartDate: string | null = null
    if (typeof startDate === "string") {
        normalizedStartDate = isValidDateOnly(startDate) ? startDate : null
    }
    else {
        normalizedStartDate = dateToDateOnly(startDate)
    }

    let normalizedEndDate: string | null = null
    if (typeof endDate === "string") {
        normalizedEndDate = isValidDateOnly(endDate) ? endDate : null
    }
    else {
        normalizedEndDate = dateToDateOnly(endDate)
    }

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

    if (normalizedStartDate === normalizedEndDate && endTime < startTime) {
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

        if (role !== "ADMIN") {
            throw new AppError("You can only create restaurant vouchers!", 403, "VOUCHER_ACCESS_FORBIDDEN")
        }
    }
    else {
        if (!restaurantId || !mongoose.isValidObjectId(restaurantId)) {
            throw new AppError("A valid restaurant ID is required for restaurant vouchers!", 400, "VOUCHER_INVALID_RESTAURANT_ID")
        }

        const restaurant = await Restaurant.findById(restaurantId).select("_id ownerId").lean()

        if (!restaurant) {
            throw new AppError("Restaurant not found!", 404, "VOUCHER_RESTAURANT_NOT_FOUND")
        }

        await ensureRestaurantAccess(restaurantId, id, role, "VOUCHER_ACCESS_FORBIDDEN")

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
        createdBy: new mongoose.Types.ObjectId(id),
        status: new Date(`${normalizedEndDate}T${endTime}:59+07:00`) < new Date() ? "INACTIVE" : "ACTIVE"
    })

    return voucher
}

const handleGetAllVouchers = async (query: GetVouchersQuery, userId: string, role: string) => {
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
    const sortOrder = resolveSortOrder(query.sortOrder)
    const allowedSortFields = ["createdAt", "updatedAt", "name", "code", "startDate", "endDate", "status"]
    const sortBy = resolveSortField(query.sortBy, allowedSortFields, "createdAt")
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
        if (!["ACTIVE", "INACTIVE", "EXPIRED", "DELETED"].includes(query.status)) {
            throw new AppError("Invalid voucher status!", 400, "VOUCHER_INVALID_STATUS")
        }
        filter.status = query.status
    }
    else {
        filter.status = { $ne: "DELETED" }
    }

    if (query.restaurantId) {
        if (!mongoose.isValidObjectId(query.restaurantId)) {
            throw new AppError("Invalid restaurant ID format!", 400, "VOUCHER_INVALID_RESTAURANT_ID")
        }
        filter.restaurantId = new mongoose.Types.ObjectId(query.restaurantId)
    }

    if (role === "OWNER") {
        const owner = await Owner.findOne({ userId }).select("_id").lean()

        if (!owner) {
            throw new AppError("Owner profile not found!", 403, "VOUCHER_ACCESS_FORBIDDEN")
        }

        const ownedRestaurants = await Restaurant
            .find({ ownerId: owner._id })
            .select("_id")
            .lean()

        const ownedRestaurantIds = ownedRestaurants.map(item => item._id)

        if (filter.restaurantId) {
            if (!ownedRestaurantIds.some(item => item.equals(filter.restaurantId))) {
                throw new AppError("You don't have permission to view this restaurant's vouchers!", 403, "VOUCHER_ACCESS_FORBIDDEN")
            }
        }
        else {
            filter.restaurantId = { $in: ownedRestaurantIds }
        }
    }

    if (query.date !== undefined) {
        const rawDate = typeof query.date === "string" ? query.date : query.date.toISOString().slice(0, 10)
        const dateStr = rawDate.slice(0, 10)

        if (!isValidDateOnly(dateStr)) {
            throw new AppError("Invalid filter date! Use YYYY-MM-DD.", 400, "VOUCHER_INVALID_FILTER_DATE")
        }

        filter.startDate = { $lte: dateStr }
        filter.endDate = { $gte: dateStr }
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

const handleGetVoucherById = async (voucherId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(voucherId)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_ID")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    const voucher = await Voucher
        .findById(voucherId)
        .populate("restaurantId", "name")
        .populate("createdBy", "fullname email")
        .lean()

    if (!voucher) {
        throw new AppError("Voucher not found!", 404, "VOUCHER_NOT_FOUND")
    }

    await ensureVoucherAccess(voucher, userId, role)

    return voucher
}

const handleUpdateVoucherStatus = async (voucherId: string, userId: string, role: string, status: string) => {
    if (!mongoose.isValidObjectId(voucherId)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_ID")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "VOUCHER_INVALID_STATUS")
    }

    const voucher = await Voucher.findById(voucherId)

    if (!voucher) {
        throw new AppError("Voucher not found!", 404, "VOUCHER_NOT_FOUND")
    }

    await ensureVoucherAccess(voucher, userId, role)

    if (voucher.status === "EXPIRED") {
        throw new AppError("Expired voucher status cannot be changed!", 400, "VOUCHER_EXPIRED")
    }

    if (voucher.status === "DELETED") {
        throw new AppError("Voucher has been deleted, restore the voucher first!", 400, "VOUCHER_DELETED")
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
        restaurantId: voucher.restaurantId,
        status: voucher.status
    }
}

const handleRestoreVoucher = async (voucherId: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(voucherId)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_ID")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Unauthorized!", 401, "VOUCHER_AUTHENTICATION_REQUIRED")
    }

    const voucher = await Voucher.findById(voucherId)

    if (!voucher) {
        throw new AppError("Voucher not found!", 404, "VOUCHER_NOT_FOUND")
    }

    await ensureVoucherAccess(voucher, userId, role)

    if (voucher.status !== "DELETED") {
        throw new AppError("Voucher has not been deleted!", 400, "VOUCHER_NOT_DELETED")
    }

    if (voucher.restaurantId) {
        const restaurant = await Restaurant.findById(voucher.restaurantId).select("_id status").lean()

        if (!restaurant) {
            throw new AppError("Restaurant not found!", 404, "VOUCHER_RESTAURANT_NOT_FOUND")
        }

        if (restaurant.status === "DELETED") {
            throw new AppError("Restaurant has been deleted, restore the restaurant first!", 400, "VOUCHER_RESTAURANT_DELETED")
        }
    }

    const voucherEndInstant = new Date(`${voucher.endDate}T${voucher.endTime}:59+07:00`)
    if (voucherEndInstant < new Date()) {
        throw new AppError("Voucher is expired!", 400, "VOUCHER_EXPIRED")
    }

    voucher.status = "ACTIVE"

    await voucher.save()

    return {
        voucherId: voucher._id,
        restaurantId: voucher.restaurantId,
        status: voucher.status
    }
}

const handleUpdateVoucher = async (voucherId: string, userId: string, role: string, params: UpdateVoucherBody) => {
    if (!mongoose.isValidObjectId(voucherId)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_ID")
    }

    if (!params || typeof params !== "object" || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "VOUCHER_UPDATE_FIELDS_REQUIRED")
    }

    const voucher = await Voucher.findById(voucherId)

    if (!voucher) {
        throw new AppError("Voucher not found!", 404, "VOUCHER_NOT_FOUND")
    }

    await ensureVoucherAccess(voucher, userId, role)

    if (voucher.status === "EXPIRED") {
        throw new AppError("Expired voucher cannot be updated!", 400, "VOUCHER_EXPIRED")
    }

    if (params.name !== undefined) {
        const name = params.name.trim()

        if (!name) {
            throw new AppError("Voucher name is required!", 400, "VOUCHER_NAME_REQUIRED")
        }

        voucher.name = name
    }

    if (params.description !== undefined) {
        voucher.description = params.description.trim()
    }

    if (params.code !== undefined) {
        const code = params.code.trim().toUpperCase()

        if (!code) {
            throw new AppError("Voucher code is required!", 400, "VOUCHER_CODE_REQUIRED")
        }

        const existingVoucher = await Voucher.findOne({
            code,
            _id: { $ne: voucher._id }
        }).lean()

        if (existingVoucher) {
            throw new AppError("Voucher code already exists!", 409, "VOUCHER_CODE_ALREADY_EXISTS")
        }

        voucher.code = code
    }

    if (params.typeVoucher !== undefined) {
        if (!["SYSTEM", "RESTAURANT"].includes(params.typeVoucher)) {
            throw new AppError("Invalid voucher type!", 400, "VOUCHER_INVALID_TYPE")
        }

        if (role === "OWNER" && params.typeVoucher !== "RESTAURANT") {
            throw new AppError("Owners can only manage restaurant vouchers!", 403, "VOUCHER_ACCESS_FORBIDDEN")
        }

        voucher.typeVoucher = params.typeVoucher

        if (params.typeVoucher === "SYSTEM") {
            voucher.restaurantId = null
        }
    }

    if (params.type !== undefined) {
        if (!["FOOD", "SHIP"].includes(params.type)) {
            throw new AppError("Invalid voucher category!", 400, "VOUCHER_INVALID_CATEGORY")
        }

        voucher.type = params.type
    }

    if (params.typeDiscount !== undefined) {
        if (!["AMOUNT", "PERCENT"].includes(params.typeDiscount)) {
            throw new AppError("Invalid discount type!", 400, "VOUCHER_INVALID_DISCOUNT_TYPE")
        }

        voucher.typeDiscount = params.typeDiscount
    }

    if (params.discountValue !== undefined) {
        if (!Number.isFinite(params.discountValue) || params.discountValue <= 0) {
            throw new AppError("Discount value must be greater than 0!", 400, "VOUCHER_INVALID_DISCOUNT_VALUE")
        }

        voucher.discountValue = params.discountValue
    }

    const finalTypeDiscount = voucher.typeDiscount
    const finalDiscountValue = voucher.discountValue

    if (finalTypeDiscount === "PERCENT" && finalDiscountValue > 100) {
        throw new AppError("Percentage discount cannot exceed 100!", 400, "VOUCHER_INVALID_DISCOUNT_PERCENT")
    }

    if (params.maxDiscount !== undefined && params.maxDiscount !== null) {
        if (!Number.isFinite(params.maxDiscount) || params.maxDiscount < 0) {
            throw new AppError("Max discount must be 0 or greater!", 400, "VOUCHER_INVALID_MAX_DISCOUNT")
        }

        voucher.maxDiscount = params.maxDiscount
    }

    if (params.minPrice !== undefined) {
        if (!Number.isFinite(params.minPrice) || params.minPrice < 0) {
            throw new AppError("Minimum price must be 0 or greater!", 400, "VOUCHER_INVALID_MIN_PRICE")
        }

        voucher.minPrice = params.minPrice
    }

    if (params.startDate !== undefined) {
        if (!isValidDateOnly(params.startDate)) {
            throw new AppError("Invalid voucher date!", 400, "VOUCHER_INVALID_DATE")
        }

        voucher.startDate = params.startDate
    }

    if (params.endDate !== undefined) {
        if (!isValidDateOnly(params.endDate)) {
            throw new AppError("Invalid voucher date!", 400, "VOUCHER_INVALID_DATE")
        }

        voucher.endDate = params.endDate
    }

    if (isValidDateOnly(voucher.startDate) && isValidDateOnly(voucher.endDate) && voucher.endDate < voucher.startDate) {
        throw new AppError("End date cannot be before start date!", 400, "VOUCHER_INVALID_DATE_RANGE")
    }

    if (params.startTime !== undefined) {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(params.startTime)) {
            throw new AppError("Invalid start time format! Use HH:mm.", 400, "VOUCHER_INVALID_START_TIME")
        }

        voucher.startTime = params.startTime
    }

    if (params.endTime !== undefined) {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(params.endTime)) {
            throw new AppError("Invalid end time format! Use HH:mm.", 400, "VOUCHER_INVALID_END_TIME")
        }

        voucher.endTime = params.endTime
    }

    if (params.maxQuantity !== undefined && params.maxQuantity !== null) {
        if (!Number.isInteger(params.maxQuantity) || params.maxQuantity < 1) {
            throw new AppError("Max quantity must be an integer greater than 0!", 400, "VOUCHER_INVALID_MAX_QUANTITY")
        }

        if (params.maxQuantity < voucher.usedQuantity) {
            throw new AppError("Max quantity cannot be less than the number of vouchers already used!", 400, "VOUCHER_MAX_QUANTITY_BELOW_USED")
        }

        voucher.maxQuantity = params.maxQuantity
    }

    await voucher.save()

    return voucher
}

const handleDeleteVoucher = async (id: string, userId: string, role: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid ID format!", 400, "VOUCHER_INVALID_ID")
    }

    const voucher = await Voucher.findById(id)

    if (!voucher) {
        throw new AppError("Voucher not found!", 404, "VOUCHER_NOT_FOUND")
    }

    await ensureVoucherAccess(voucher, userId, role)

    if (voucher.status === "DELETED") {
        throw new AppError("Voucher has already been deleted!", 400, "VOUCHER_ALREADY_DELETED")
    }

    voucher.status = "DELETED"

    await voucher.save()

    return {
        voucherId: voucher._id,
        restaurantId: voucher.restaurantId,
        status: voucher.status
    }
}


export { handleCreateVoucher, handleGetAllVouchers, handleGetVoucherById, handleUpdateVoucherStatus, handleRestoreVoucher, handleUpdateVoucher, handleDeleteVoucher }
