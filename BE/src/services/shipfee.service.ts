import mongoose from "mongoose"
import * as geolib from "geolib"
import { AppError } from "../errors/AppError"
import { ShipFeeCalculateQuery, ShipFeeSearchQuery, CreateShipFeeParams, UpdateShipFeeParams } from "../interfaces/shipfee.interface"
import ShipFee from "../models/shipfee.model"
import Restaurant from "../models/restaurant.model"

const handleCalculateShipFee = async (restaurantId: string, params: ShipFeeCalculateQuery) => {
    if (!mongoose.isValidObjectId(restaurantId)) {
        throw new AppError("Invalid restaurant ID format!", 400, "SHIPFEE_INVALID_RESTAURANT_ID")
    }

    const restaurant = await Restaurant.findById(restaurantId)

    if (!restaurant) {
        throw new AppError("Restaurant not found!", 404, "SHIPFEE_RESTAURANT_NOT_FOUND")
    }

    const rLat = restaurant.latitude
    const rLng = restaurant.longitude
    const cLat = Number(params.customerLat)
    const cLng = Number(params.customerLng)

    if (isNaN(cLat) || isNaN(cLng)) {
        throw new AppError("Invalid coordinates!", 400, "SHIPFEE_INVALID_COORDINATES")
    }

    const distanceMeters = geolib.getDistance(
        { latitude: rLat, longitude: rLng },
        { latitude: cLat, longitude: cLng }
    )

    const distanceKm = Number((distanceMeters / 1000).toFixed(1))

    const activeRules = await ShipFee.find({ status: "ACTIVE" })
    const baseRule = activeRules.find(r => r.ruleType === "BASE_FEE")

    if (!baseRule) {
        throw new AppError("Base fee not configured!", 400)
    }

    const baseFee = baseRule.baseFee
    const perKmFee = baseRule.perKmFee

    const extraKm = Math.max(0, distanceKm - 1)
    let totalFee = baseFee + (extraKm * perKmFee)

    const now = new Date()
    const currentHour = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const currentMonthDay = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const currentDay = now.getDay()

    for (const rule of activeRules) {
        if (rule.ruleType === "PEAK_HOUR" && rule.startTime && rule.endTime) {
            if (currentHour >= rule.startTime && currentHour <= rule.endTime) {
                totalFee *= rule.multiplier
            }
        }
        else if (rule.ruleType === "WEEKEND") {
            if (currentDay === 0 || currentDay === 6) {
                totalFee *= rule.multiplier
            }
        }
        else if (rule.ruleType === "HOLIDAY") {
            if (rule.specialDate && currentMonthDay === rule.specialDate) {
                totalFee *= rule.multiplier
            }
        }
        else if (rule.ruleType === "WEATHER" && rule.status) {
            totalFee *= rule.multiplier
        }
    }

    return {
        distance: distanceKm,
        shipfee: totalFee
    }
}

const handleGetAllShipFee = async (query: ShipFeeSearchQuery) => {
    const search = query.search?.trim()
    const ruleType = query.ruleType?.trim()
    const status = query.status
    const specialDate = query.specialDate?.trim()
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? 1 : -1
    const skip = (page - 1) * limit

    const mongoQuery: Record<string, any> = {}

    if (search) {
        mongoQuery.$or = [
            { name: { $regex: search, $options: "i" } }
        ]
    }

    if (ruleType !== undefined) {
        if (!["BASE_FEE", "PEAK_HOUR", "WEEKEND", "HOLIDAY", "WEATHER"].includes(ruleType)) {
            throw new AppError("Invalid rule type!", 400, "SHIP_FEE_INVALID_TYPE")
        }
        mongoQuery.ruleType = ruleType
    }

    if (status !== undefined) {
        mongoQuery.status = status
    }

    if (specialDate) {
        mongoQuery.specialDate = specialDate
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    const [shipFee, total] = await Promise.all([
        ShipFee
            .find(mongoQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        ShipFee.countDocuments(mongoQuery)
    ])

    return {
        shipFee,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const handleCreateShipFee = async (params: CreateShipFeeParams) => {
    const { ruleType, name, multiplier, startTime, endTime, specialDate } = params

    if (!Number.isFinite(multiplier) || multiplier <= 0) {
        throw new AppError("Invalid multiplier!", 400, "SHIPFEE_INVALID_MULTIPLIER")
    }

    if (ruleType === "PEAK_HOUR") {
        if (!startTime || !endTime) {
            throw new AppError("Start time and end time are required!", 400, "SHIPFEE_TIME_REQUIRED")
        }

        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

        if (!timeRegex.test(startTime) || !timeRegex.test(endTime) || startTime >= endTime) {
            throw new AppError("Invalid time range!", 400, "SHIPFEE_INVALID_TIME")
        }

        const overlappingRule = await ShipFee.findOne({
            ruleType: "PEAK_HOUR",
            status: { $ne: "DELETED" },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        })

        if (overlappingRule) {
            throw new AppError(`Peak hour overlaps with existing rule (${overlappingRule.name}): ${overlappingRule.startTime} - ${overlappingRule.endTime}`, 409, "SHIPFEE_TIME_OVERLAP")
        }
    }

    if (ruleType === "WEEKEND") {
        const existing = await ShipFee.findOne({
            ruleType: "WEEKEND",
            status: { $ne: "DELETED" },
        })

        if (existing) {
            throw new AppError("Weekend rule already exists!", 409, "SHIPFEE_WEEKEND_EXISTS")
        }
    }

    if (ruleType === "HOLIDAY") {
        if (!specialDate || !/^\d{2}-\d{2}$/.test(specialDate)) {
            throw new AppError("Invalid special date! Use DD-MM.", 400, "SHIPFEE_INVALID_DATE")
        }

        const existing = await ShipFee.findOne({
            ruleType: "HOLIDAY",
            specialDate: specialDate,
            status: { $ne: "DELETED" }
        })

        if (existing) {
            throw new AppError("Holiday rule already exists!", 409, "SHIPFEE_HOLIDAY_EXISTS")
        }
    }

    const result = await ShipFee.create({
        ruleType: ruleType,
        name: name.trim(),
        multiplier: multiplier,
        startTime: ruleType === "PEAK_HOUR" ? startTime : null,
        endTime: ruleType === "PEAK_HOUR" ? endTime : null,
        specialDate: ruleType === "HOLIDAY" ? specialDate : null,
    })

    return result
}

const handleUpdateShipFee = async (shipId: string, params: UpdateShipFeeParams) => {
    if (!mongoose.isValidObjectId(shipId)) {
        throw new AppError("Invalid ID format!", 400, "SHIPFEE_INVALID_ID")
    }

    const shipfee = await ShipFee.findOne({
        _id: shipId,
        status: { $ne: "DELETED" }
    })

    if (!shipfee) {
        throw new AppError("Ship fee not found or has been deleted!", 404, "SHIPFEE_NOT_FOUND")
    }

    const { name, baseFee, perKmFee, multiplier, startTime, endTime, specialDate } = params

    if (name !== undefined) {
        shipfee.name = name.trim()
    }

    if (shipfee.ruleType === "BASE_FEE") {
        if (baseFee !== undefined) {
            if (!Number.isFinite(baseFee) || baseFee <= 0) {
                throw new AppError("Invalid base fee!", 400, "SHIPFEE_INVALID_BASEFEE")
            }
            shipfee.baseFee = baseFee
        }

        if (perKmFee !== undefined) {
            if (!Number.isFinite(perKmFee) || perKmFee <= 0) {
                throw new AppError("Invalid per km fee!", 400, "SHIPFEE_INVALID_PERKMFEE")
            }
            shipfee.perKmFee = perKmFee
        }
    }
    else {
        if (multiplier !== undefined) {
            if (!Number.isFinite(multiplier) || multiplier <= 0) {
                throw new AppError("Invalid multiplier!", 400, "SHIPFEE_INVALID_MULTIPLIER")
            }
            shipfee.multiplier = multiplier
        }
    }

    if (shipfee.ruleType === "PEAK_HOUR") {
        const finalStartTime = startTime !== undefined ? startTime : shipfee.startTime
        const finalEndTime = endTime !== undefined ? endTime : shipfee.endTime
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

        if (!finalStartTime || !finalEndTime || !timeRegex.test(finalStartTime) || !timeRegex.test(finalEndTime) || finalStartTime >= finalEndTime) {
            throw new AppError("Invalid time range!", 400, "SHIPFEE_INVALID_TIME")
        }

        const overlappingRule = await ShipFee.findOne({
            _id: { $ne: shipId },
            ruleType: "PEAK_HOUR",
            status: { $ne: "DELETED" },
            startTime: { $lt: finalEndTime },
            endTime: { $gt: finalStartTime }
        })

        if (overlappingRule) {
            throw new AppError(`Peak hour overlaps with existing rule (${overlappingRule.name}): ${overlappingRule.startTime} - ${overlappingRule.endTime}`, 409, "SHIPFEE_TIME_OVERLAP")
        }

        shipfee.startTime = finalStartTime
        shipfee.endTime = finalEndTime
    }

    if (shipfee.ruleType === "HOLIDAY") {
        if (!specialDate || !/^\d{2}-\d{2}$/.test(specialDate)) {
            throw new AppError("Invalid special date! Use DD-MM.", 400, "SHIPFEE_INVALID_DATE")
        }

        const existing = await ShipFee.findOne({
            _id: { $ne: shipId },
            ruleType: "HOLIDAY",
            specialDate: specialDate,
            status: { $ne: "DELETED" }
        })

        if (existing) {
            throw new AppError("Holiday rule already exists!", 409, "SHIPFEE_HOLIDAY_EXISTS")
        }
        shipfee.specialDate = specialDate
    }

    const result = await shipfee.save()
    return result
}

const handleUpdateShipFeeStatus = async (shipId: string, status: "ACTIVE" | "INACTIVE") => {
    if (!mongoose.isValidObjectId(shipId)) {
        throw new AppError("Invalid ID format!", 400, "SHIPFEE_INVALID_ID")
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new AppError("Invalid status!", 400, "SHIPFEE_INVALID_STATUS")
    }

    const shipfee = await ShipFee.findById(shipId)

    if (!shipfee) {
        throw new AppError("Ship-fee not found!", 404, "SHIPFEE_NOT_FOUND")
    }

    if (shipfee.ruleType === "BASE_FEE") {
        throw new AppError("Base ship fee can't be disabled!", 400, "SHIPFEE_BASE_FEE_CANNOT_TOGGLE")
    }

    if (shipfee.status === "DELETED") {
        throw new AppError("Ship-fee has been deleted!", 404, "SHIPFEE_DELETED")
    }

    if (shipfee.status === status) {
        throw new AppError("Ship-fee already has this status!", 400, "SHIPFEE_STATUS_UNCHANGED")
    }

    shipfee.status = status
    await shipfee.save()
}

const handleDeleteShipFee = async (shipId: string) => {
    if (!mongoose.isValidObjectId(shipId)) {
        throw new AppError("Invalid ID format!", 400, "SHIPFEE_INVALID_ID")
    }

    const shipfee = await ShipFee.findById(shipId)

    if (!shipfee) {
        throw new AppError("Ship-fee not found!", 404, "SHIPFEE_NOT_FOUND")
    }

    if (shipfee.ruleType === "BASE_FEE") {
        throw new AppError("Base ship fee can't be deleted!", 400, "SHIPFEE_BASE_FEE_CANNOT_DELETE")
    }

    if (shipfee.status === "DELETED") {
        throw new AppError("Ship-fee has been deleted!", 404, "SHIPFEE_DELETED")
    }

    shipfee.status = "DELETED"
    await shipfee.save()
}

export { handleCalculateShipFee, handleGetAllShipFee, handleCreateShipFee, handleUpdateShipFee, handleUpdateShipFeeStatus, handleDeleteShipFee }