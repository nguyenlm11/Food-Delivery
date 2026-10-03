import { Request, Response } from "express"
import { handleGetAllDrivers } from "../services/driver.service"

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

export { getAllDriversAPI }