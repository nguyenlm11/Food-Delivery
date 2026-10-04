import { Socket } from "socket.io"
import Driver from "../models/driver.model"
import DriverLocation from "../models/driver_location.model"

const disconnectTimers = new Map<string, NodeJS.Timeout>()

const driverSocket = async (socket: Socket) => {
    const userId = socket.data.user.id

    // Cancel OFFLINE timer nếu Driver reconnect
    const oldTimer = disconnectTimers.get(userId)

    if (oldTimer) {
        clearTimeout(oldTimer)
        disconnectTimers.delete(userId)
    }

    // ONLINE
    await Driver.findOneAndUpdate(
        { userId },
        { status: "ONLINE" }
    )

    socket.on("driver:location:update", async (data) => {
        try {
            const {
                latitude,
                longitude,
                accuracy
            } = data

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number"
            ) {
                return
            }

            const driver = await Driver.findOne({
                userId
            })

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
            console.error(
                "Driver location update error:",
                error
            )
        }
    })

    socket.on("disconnect", () => {
        const timer = setTimeout(async () => {
            try {
                await Driver.findOneAndUpdate(
                    {
                        userId,
                        status: "ONLINE"
                    },
                    {
                        status: "OFFLINE"
                    }
                )

                disconnectTimers.delete(userId)

                console.log(
                    `Driver ${userId} is now OFFLINE`
                )
            }
            catch (error) {
                console.error(
                    "Update driver offline error:",
                    error
                )
            }
        }, 30_000)

        disconnectTimers.set(userId, timer)
    })
}

export default driverSocket