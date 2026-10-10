import { Request, Response } from "express"
import { handleCreateDriver, handleGetAllDrivers } from "../services/driver.service"
import { createAndEmitNotification } from "../utils/notification.util"
import { DriverParams } from "../interfaces/interface"
import { AppError } from "../errors/error"
import { getIO } from "../configs/socket"

const createDriverAPI = async (req: Request, res: Response) => {
    try {
        const params: DriverParams = req.body

        if (!params || Object.keys(params).length === 0) {
            throw new AppError("Request body cannot be empty", 400)
        }

        const data = await handleCreateDriver(params)

        getIO()
            .to("admins")
            .emit("driver:created", {
                driverId: data?._id
            })

        return res.status(201).json({
            message: "Driver account created successfully. Login information has been sent to the driver's email.",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

const getAllDriversAPI = async (req: Request, res: Response) => {
    try {
        const data = await handleGetAllDrivers()

        return res.status(200).json({
            message: "Get all drivers successfully!",
            data: data
        })
    }
    catch (error: any) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            message: error.message || "Internal server error"
        })
    }
}

export { getAllDriversAPI, createDriverAPI }