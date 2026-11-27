import { Socket } from "socket.io"
import { Driver, DriverLocation } from "../models/driver.model"
import { getIO } from "../configs/socket"

const disconnectTimers = new Map<string, NodeJS.Timeout>()

const notifyAdmins = (event: string, payload: Record<string, unknown>) => {
    try {
        getIO()
            .to("admins")
            .emit(event, payload)
    }
    catch (error) {
        console.error("Emit driver presence event error:", error)
    }
}

const driverSocket = async (socket: Socket) => {
    const userId = socket.data.user.id
    const oldTimer = disconnectTimers.get(userId)

    if (oldTimer) {
        clearTimeout(oldTimer)
        disconnectTimers.delete(userId)
    }

    await Driver.findOneAndUpdate(
        { userId },
        { $set: { presenceStatus: "ONLINE", lastActiveAt: new Date() } }
    )

    notifyAdmins("driver:presence:updated", { userId, presenceStatus: "ONLINE", lastActiveAt: new Date() })

    socket.on("driver:location:update", async (data) => {
        try {
            const { latitude, longitude, accuracy } = data

            if (typeof latitude !== "number" || typeof longitude !== "number") {
                return
            }

            const driver = await Driver.findOne({ userId: userId })

            if (!driver) {
                return
            }

            await DriverLocation.findOneAndUpdate(
                { driverId: driver._id },
                {
                    latitude,
                    longitude,
                    accuracy: accuracy ?? null
                }
            )
        }
        catch (error) {
            console.error("Driver location update error:", error)
        }
    })

    socket.on("disconnect", () => {
        const timer = setTimeout(async () => {
            try {
                await Driver.findOneAndUpdate(
                    { userId, presenceStatus: "ONLINE" },
                    { $set: { presenceStatus: "OFFLINE", lastActiveAt: new Date() } }
                )
                disconnectTimers.delete(userId)
                notifyAdmins("driver:presence:updated", { userId, presenceStatus: "OFFLINE", lastActiveAt: new Date() })
                console.log(`Driver ${userId} is now OFFLINE`)
            }
            catch (error) {
                console.error("Update driver offline error:", error)
            }
        }, 30_000)

        disconnectTimers.set(userId, timer)
    })
}

export default driverSocket