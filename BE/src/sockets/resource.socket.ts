import { Socket } from "socket.io"
import { ensureRestaurantAccess } from "../services/restaurant.service"

const JOINABLE_RESOURCE_TYPES = ["restaurant"]

const resourceSocket = (socket: Socket) => {
    const { id: userId, role } = socket.data.user

    socket.on("resource:join", async (data) => {
        try {
            const { type, id } = data ?? {}

            if (!type || !id) {
                return
            }

            if (!JOINABLE_RESOURCE_TYPES.includes(type)) {
                console.warn(`Socket ${socket.id} tried to join unsupported room type "${type}"`)
                return
            }

            await ensureRestaurantAccess(id, userId, role, "SOCKET_RESOURCE_ACCESS_FORBIDDEN")

            const room = `${type}:${id}`
            socket.join(room)
            console.log(`Socket ${socket.id} joined room ${room}`)
        }
        catch (error) {
            console.warn(
                `Socket ${socket.id} was denied joining room "${data?.type}:${data?.id}":`,
                error instanceof Error ? error.message : error
            )
        }
    })

    socket.on("resource:leave", (data) => {
        try {
            const { type, id } = data ?? {}

            if (!type || !id) {
                return
            }

            const reservedRoomTypes = ["user", "admins", "owners", "restaurants", "drivers", "customers"]

            if (reservedRoomTypes.includes(type)) {
                return
            }

            if (!JOINABLE_RESOURCE_TYPES.includes(type)) {
                return
            }

            const room = `${type}:${id}`
            socket.leave(room)
            console.log(`Socket ${socket.id} left room ${room}`)
        }
        catch (error) {
            console.error("Resource leave error:", error)
        }
    })
}

export default resourceSocket
