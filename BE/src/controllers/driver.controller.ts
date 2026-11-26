import { Request, Response } from "express"
import { handleCreateDriver, handleGetAllDrivers, handleGetDriverById } from "../services/driver.service"
import { CreateDriverBody, GetDriversQuery } from "../interfaces/driver.interface"
import { AppError } from "../errors/AppError"
import { getIO } from "../configs/socket"

const createDriverAPI = async (req: Request, res: Response) => {
    const body: CreateDriverBody = req.body

    if (!body || Object.keys(body).length === 0) {
        throw new AppError("Missing required fields!", 400, "DRIVER_REQUIRED_FIELDS")
    }

    const data = await handleCreateDriver(body)
    getIO()
        .to("admins")
        .emit("driver:created", { driverId: data?._id })

    return res.status(201).json({
        message: data.emailSent
            ? "Driver account created successfully. Login information has been sent to the driver's email."
            : "Driver account created successfully, but failed to send login information to the driver's email!",
        data: data
    })
}

const getAllDriversAPI = async (req: Request, res: Response) => {
    const query: GetDriversQuery = req.query
    const data = await handleGetAllDrivers(query)

    return res.status(200).json({
        message: "Get all drivers successfully!",
        data: data
    })
}

const getDriverByIdAPI = async (req: Request, res: Response) => {
    const driverId = String(req.params.driverId)

    const data = await handleGetDriverById(driverId)

    return res.status(200).json({
        message: "Get driver information successfully!",
        data: data
    })
}

export { getAllDriversAPI, getDriverByIdAPI, createDriverAPI }