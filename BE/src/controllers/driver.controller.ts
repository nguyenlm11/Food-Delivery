import { Request, Response } from "express"
import { handleCreateDriver, handleGetAllDrivers } from "../services/driver.service"
// import { createAndEmitNotification } from "../utils/notification.util"
import { DriverParams } from "../interfaces/driver.interface"
import { AppError } from "../errors/AppError"
import { getIO } from "../configs/socket"

const createDriverAPI = async (req: Request, res: Response) => {
    const params: DriverParams = req.body

    if (!params || Object.keys(params).length === 0) {
        throw new AppError("Missing required fields!", 400, "DRIVER_REQUIRED_FIELDS")
    }

    const data = await handleCreateDriver(params)
    getIO()
        .to("admins")
        .emit("driver:created", { driverId: data?._id })

    return res.status(201).json({
        message: "Driver account created successfully. Login information has been sent to the driver's email.",
        data: data
    })
}

const getAllDriversAPI = async (req: Request, res: Response) => {
    const data = await handleGetAllDrivers()

    return res.status(200).json({
        message: "Get all drivers successfully!",
        data: data
    })
}

export { getAllDriversAPI, createDriverAPI }