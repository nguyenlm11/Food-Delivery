import axios, { type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, setAccessToken } from "./token.service"

console.log("API URL:", import.meta.env.VITE_API_URL)

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

// Dùng một Axios riêng để gọi refresh, tránh interceptor tự gọi lại chính nó.
const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

let refreshPromise: Promise<string> | null = null

api.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
        const requestUrl = originalRequest?.url

        if (error.response?.status === 401 && originalRequest?._retry) {
            setAccessToken(null)
            window.dispatchEvent(new Event("auth:session-expired"))
            return Promise.reject(error)
        }

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            requestUrl?.includes("/auth/login") ||
            requestUrl?.includes("/auth/refresh-token")
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            if (!refreshPromise) {
                refreshPromise = refreshApi
                    .post("/auth/refresh-token")
                    .then((response) => response.data.data.accessToken as string)
                    .finally(() => {
                        refreshPromise = null
                    })
            }

            const newAccessToken = await refreshPromise
            setAccessToken(newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

            // Gửi lại request cũ với access token vừa nhận.
            return api(originalRequest)
        }
        catch (refreshError) {
            setAccessToken(null)
            window.dispatchEvent(new Event("auth:session-expired"))
            return Promise.reject(refreshError)
        }
    },
)

export default api
