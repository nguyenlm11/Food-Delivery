import { io } from "socket.io-client"
import { requestNewAccessToken } from "./api"
import { getAccessToken, setAccessToken } from "./token"

const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") ?? window.location.origin

const socket = io(socketUrl, {
    autoConnect: false,
    auth: (callback: (data: object) => void) => {
        callback({ token: getAccessToken() })
    }
})

export const connectSocket = () => {
    const token = getAccessToken()

    if (!token) {
        return
    }

    socket.auth = { token }

    if (socket.connected) {
        socket.disconnect()
    }

    socket.connect()
}

export const disconnectSocket = () => {
    socket.disconnect()
}

socket.on("connect_error", async (error) => {
    const message = error?.message ?? ""

    if (message !== "Access token has expired!" && message !== "Invalid access token!") {
        return
    }

    const newToken = await requestNewAccessToken()

    if (!newToken) {
        socket.disconnect()
        window.dispatchEvent(new Event("auth:session-expired"))
        return
    }

    setAccessToken(newToken)
    socket.connect()
})

export default socket
