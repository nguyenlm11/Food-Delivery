import axios from "axios"
import { getAccessToken } from "./token.service"

console.log("API URL:", import.meta.env.VITE_API_URL)

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default api