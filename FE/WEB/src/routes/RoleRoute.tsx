import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingOverlay from "../components/LoadingOverlay"

interface RoleRouteProps {
    allowedRoles: string[]
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <LoadingOverlay message={"Đang tải dữ liệu"} />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    const role = user?.roleId?.name

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default RoleRoute