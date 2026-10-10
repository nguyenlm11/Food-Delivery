import { Socket } from "socket.io"

const resourceSocket = (socket: Socket) => {
    socket.on("resource:join", (data) => {
        try {
            const { type, id } = data

            if (!type || !id) {
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