import mongoose from "mongoose"
import * as geolib from "geolib"
import { AppError } from "../errors/AppError"
import { ShipFeeCalculateQuery } from "../interfaces/interface"
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

    const activeRules = await ShipFee.find({ isActive: true })
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
    const currentMonthDay = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
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
        else if (rule.ruleType === "WEATHER" && rule.isActive) {
            totalFee *= rule.multiplier
        }
    }

    return {
        distance: distanceKm,
        shipfee: totalFee
    }
}


export { handleCalculateShipFee }