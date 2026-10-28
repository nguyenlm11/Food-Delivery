import { io } from "socket.io-client"
import { getAccessToken } from "./token.service"

const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") ?? window.location.origin

const socket = io(socketUrl, {
    autoConnect: false,
    auth: (callback: (data: object) => void) => {
        callback({ token: getAccessToken() })
    }
})

export default socket
