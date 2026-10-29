import { Socket } from "socket.io"

const resourceSocket = (socket: Socket) => {
    socket.on("resource:join", (data) => {
        try {
            const { type, id } = data

            if (!type || !id) {
                return
            }

            const reservedRoomTypes = ["user", "admins", "owners", "restaurants", "drivers"]

            if (reservedRoomTypes.includes(type)) {
                console.warn(`Socket ${socket.id} tried to join reserved room type "${type}"`)
                return
            }

            const room = `${type}:${id}`
            socket.join(room)
            console.log(`Socket ${socket.id} joined room ${room}`)
        }
        catch (error) {
            console.error("Resource join error:", error)
        }
    })

    socket.on("resource:leave", (data) => {
        try {
            const { type, id } = data

            if (!type || !id) {
                return
            }

            const reservedRoomTypes = ["user", "admins", "owners", "restaurants", "drivers"]

            if (reservedRoomTypes.includes(type)) {
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
