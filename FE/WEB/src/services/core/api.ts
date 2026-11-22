import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, setAccessToken } from "./token"

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

// Instance riêng cho refresh-token: không gắn interceptor response để tránh loop vô hạn.
const refreshApi = axios.create(api.defaults)

const authPathsWithoutRefresh = [
    "/auth/login",
    "/auth/staff-login",
    "/auth/refresh-token",
]

let refreshPromise: Promise<string | undefined> | null = null

const isSessionInvalid = (error: unknown) => {
    const status = (error as AxiosError)?.response?.status
    return status === 401 || status === 403
}

const canRetryWithRefresh = (url?: string) => {
    if (!url) {
        return false
    }

    return !authPathsWithoutRefresh.some((path) => url.includes(path))
}

const endSession = () => {
    setAccessToken(null)
    window.dispatchEvent(new Event("auth:session-expired"))
}

export const requestNewAccessToken = async (): Promise<string | undefined> => {
    if (!refreshPromise) {
        const pending = refreshApi
            .post("/auth/refresh-token")
            .then((response) => response.data.data.accessToken as string | undefined)
            .catch(() => undefined)
            .finally(() => {
                refreshPromise = null
            })

        refreshPromise = pending
    }

    return refreshPromise
}

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
            endSession()
            return Promise.reject(error)
        }

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            !canRetryWithRefresh(requestUrl)
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        let newAccessToken: string | undefined
        try {
            newAccessToken = await requestNewAccessToken()
        }
        catch (refreshError) {
            if (isSessionInvalid(refreshError)) {
                endSession()
            }
            return Promise.reject(error)
        }

        if (!newAccessToken) {
            endSession()
            return Promise.reject(error)
        }

        setAccessToken(newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
    },
)

export default api
