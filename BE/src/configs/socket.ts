import { Server } from "socket.io"
import http from "http"
import jwt from "jsonwebtoken"
import driverSocket from "../sockets/driver.socket"
import resourceSocket from "../sockets/resource.socket"
import Owner from "../models/owner.model"
import Restaurant from "../models/restaurant.model"

let io: Server

const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "http://127.0.0.1:5500",
                "http://127.0.0.1:5173",
                "http://localhost:5173",
                "https://foodie-rho-smoky.vercel.app"
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

    io.on("connection", async (socket) => {
        const user = socket.data.user
        const userId = user.id
        const role = user.role

        console.log(`Socket connected: ${socket.id} - User: ${userId} - Role: ${role}`)

        socket.join(`user:${userId}`)

        if (role === "ADMIN") {
            socket.join("admins")
        }

        if (role === "CUSTOMER") {
            socket.join("customers")
        }

        if (role === "OWNER") {
            socket.join("owners")
            // Owner có thể sở hữu nhiều nhà hàng -> join room của từng nhà hàng
            const owner = await Owner
                .findOne({ userId })
                .select("_id")
                .lean()

            if (owner) {
                const ownedRestaurants = await Restaurant
                    .find({ ownerId: owner._id })
                    .select("_id")
                    .lean()

                for (const restaurant of ownedRestaurants) {
                    socket.join(`restaurant:${restaurant._id}`)
                }
            }
        }

        if (role === "RESTAURANT") {
            socket.join("restaurants")

            // Tài khoản nhà hàng -> chỉ join room nhà hàng được liên kết trực tiếp
            const restaurant = await Restaurant
                .findOne({ userId })
                .select("_id")
                .lean()

            if (restaurant) {
                socket.join(`restaurant:${restaurant._id}`)
            }
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