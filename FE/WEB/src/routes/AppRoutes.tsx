import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import LoginPage from "@/pages/auth/LoginPage"
import adminRoutes from "./AdminRoutes"
import ownerRoutes from "./OwnerRoutes"
import restaurantRoutes from "./RestaurantRoutes"
import RoleRoute from "./guards/RoleRoute"

const getDashboardPath = (role?: string) => {
    switch (role) {
        case "ADMIN":
            return "/admin"
        case "OWNER":
            return "/owner"
        case "RESTAURANT":
            return "/restaurant"
        default:
            return "/login"
    }
}

const AppRoutes = () => {
    const { user, isAuthenticated } = useAuth()

    const role = user?.roleId?.name

    const dashboardPath = getDashboardPath(role)

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={dashboardPath} replace /> : <LoginPage />}
            />

            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                {adminRoutes}
            </Route>

            <Route element={<RoleRoute allowedRoles={["OWNER"]} />}>
                {ownerRoutes}
            </Route>

            <Route element={<RoleRoute allowedRoles={["RESTAURANT"]} />}>
                {restaurantRoutes}
            </Route>

            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? dashboardPath : "/login"} replace />}
            />

            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? dashboardPath : "/login"} replace />}
            />
        </Routes>
    )
}

export default AppRoutes
