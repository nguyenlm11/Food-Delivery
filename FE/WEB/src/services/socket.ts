import { io } from "socket.io-client"
import { getAccessToken, setAccessToken } from "./token.service"

const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") ?? window.location.origin

const socket = io(socketUrl, {
    autoConnect: false,
    auth: (callback: (data: object) => void) => {
        callback({ token: getAccessToken() })
    }
})

let isRefreshing = false
let refreshPromise: Promise<string | undefined> | null = null

const refreshAccessToken = async (): Promise<string | undefined> => {
    if (isRefreshing) {
        return refreshPromise ?? undefined
    }

    isRefreshing = true

    refreshPromise = (async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL ?? "/api"}/auth/refresh-token`, {
                method: "POST",
                credentials: "include"
            })

            if (!response.ok) {
                return undefined
            }

            const result = await response.json()

            return result?.data?.accessToken as string | undefined
        }
        catch {
            return undefined
        }
        finally {
            isRefreshing = false
            refreshPromise = null
        }
    })()

    return refreshPromise
}


// Kết nối socket bằng access token hiện tại
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

// Ngắt kết nối socket. Dùng khi logout hoặc hết phiên.
export const disconnectSocket = () => {
    socket.disconnect()
}

socket.on("connect_error", async (error) => {
    const message = error?.message ?? ""

    if (message !== "Access token has expired!" && message !== "Invalid access token!") {
        return
    }

    const newToken = await refreshAccessToken()

    if (!newToken) {
        socket.disconnect()
        window.dispatchEvent(new Event("auth:session-expired"))
        return
    }

    setAccessToken(newToken)
    socket.connect()
})

export default socket
