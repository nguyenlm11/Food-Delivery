import { Server } from "socket.io"
import http from "http"
import jwt from "jsonwebtoken"
import driverSocket from "../sockets/driver.socket"
import resourceSocket from "../sockets/resource.socket"

let io: Server

const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "http://127.0.0.1:5500",
                "http://localhost:5173"
            ],
            credentials: true
        }
    })

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token
            const secret = process.env.JWT_ACCESS_SECRET

            if (!token) {
                return next(new Error("Access token is missing!"))
            }

            if (!secret) {
                return next(new Error("JWT_ACCESS_SECRET is not defined!"))
            }

            const dataDecoded: any = jwt.verify(token, secret)

            socket.data.user = {
                id: dataDecoded.id,
                fullname: dataDecoded.fullname,
                email: dataDecoded.email,
                role: dataDecoded.role
            }
            next()
        }
        catch (error: any) {
            if (error.name === "TokenExpiredError") {
                return next(new Error("Access token has expired!"))
            }
            return next(new Error("Invalid access token!"))
        }
    })

    io.on("connection", (socket) => {
        const user = socket.data.user
        const userId = user.id
        const role = user.role

        console.log(`Socket connected: ${socket.id} - User: ${userId}`)

        socket.join(`user:${userId}`)

        if (role === "ADMIN") {
            socket.join("admins")
        }

        if (role === "OWNER") {
            socket.join("owners")
        }

        if (role === "DRIVER") {
            socket.join("drivers")
            driverSocket(socket)
        }

        resourceSocket(socket)

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`)
        })
    })

    return io
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO is not initialized!")
    }

    return io
}

export default initSocket