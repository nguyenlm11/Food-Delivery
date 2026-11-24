import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, } from "react"
import { login, logout as logoutRequest, refreshAccessToken, getMe } from "@/services/auth.service"
import { setAccessToken } from "@/services/core/token"
import { connectSocket, disconnectSocket } from "@/services/core/socket"
import type { LoginBody } from "../types/auth.type"

interface AuthUser {
    fullname?: string
    email?: string
    avatar?: string
    roleId?: { name?: string }
}

interface AuthContextType {
    user: any
    isAuthenticated: boolean
    isLoading: boolean
    login: (body: LoginBody) => Promise<AuthUser>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = user !== null

    const clearSession = useCallback(() => {
        disconnectSocket()
        setAccessToken(null)
        setUser(null)
    }, [])

    const loadUser = useCallback(async (accessToken: string): Promise<AuthUser> => {
        setAccessToken(accessToken)
        const response = await getMe()
        setUser(response.data)
        connectSocket()
        return response.data
    }, [])

    const handleLogin = async (body: LoginBody): Promise<AuthUser> => {
        const response = await login(body)
        const accessToken = response.data.accessToken
        return await loadUser(accessToken)
    }

    const logout = async () => {
        await logoutRequest()
        clearSession()
    }

    useEffect(() => {
        const handleSessionExpired = () => {
            clearSession()
        }

        window.addEventListener("auth:session-expired", handleSessionExpired)

        const restoreSession = async () => {
            try {
                const response = await refreshAccessToken()
                const accessToken = response.data.accessToken

                if (!accessToken) {
                    clearSession()
                    return
                }

                await loadUser(accessToken)
            }
            catch {
                clearSession()
            }
            finally {
                setIsLoading(false)
            }
        }

        void restoreSession()

        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired)
            disconnectSocket()
        }
    }, [loadUser, clearSession])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login: handleLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    return context
}
