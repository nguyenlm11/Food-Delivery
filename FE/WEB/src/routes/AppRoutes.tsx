import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoginPage from "../pages/auth/LoginPage"
import DashboardLayout from "../components/layout/DashboardLayout"
import RoleRoute from "./RoleRoute"
import CategoryPage from "../pages/admin/CategoryPage"
import LoadingOverlay from "../components/LoadingOverlay"

const AppRoutes = () => {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <LoadingOverlay message={"Đang tải..."} fullScreen />
    }

    const role = user?.roleId?.name

    const getDashboardPath = () => {
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

    return (
        <Routes>
            {/* AUTH */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <LoginPage />}
            />

            {/* ADMIN */}
            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/admin"
                        element={<div>Tổng quan Admin</div>}
                    />
                    <Route
                        path="/admin/users"
                        element={<div>Quản lý người dùng</div>}
                    />
                    <Route
                        path="/admin/users/customers"
                        element={<div>Quản lý khách hàng</div>}
                    />
                    <Route
                        path="/admin/users/owners"
                        element={<div>Quản lý chủ nhà hàng</div>}
                    />
                    <Route
                        path="/admin/users/drivers"
                        element={<div>Quản lý tài xế</div>}
                    />
                    <Route
                        path="/admin/restaurants"
                        element={<div>Quản lý nhà hàng</div>}
                    />
                    <Route
                        path="/admin/food-categories"
                        element={<CategoryPage />}
                    />
                    <Route
                        path="/admin/orders"
                        element={<div>Quản lý đơn hàng</div>}
                    />
                    <Route
                        path="/admin/vouchers"
                        element={<div>Quản lý voucher</div>}
                    />
                </Route>
            </Route>

            {/* OWNER */}
            <Route element={<RoleRoute allowedRoles={["OWNER"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/owner"
                        element={<div>Tổng quan Owner</div>}
                    />
                    <Route
                        path="/owner/restaurants"
                        element={<div>Nhà hàng của tôi</div>}
                    />
                </Route>
            </Route>

            {/* RESTAURANT */}
            <Route element={<RoleRoute allowedRoles={["RESTAURANT"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/restaurant"
                        element={<div>Tổng quan nhà hàng</div>}
                    />
                    <Route
                        path="/restaurant/menu"
                        element={<div>Quản lý menu</div>}
                    />
                    <Route
                        path="/restaurant/orders"
                        element={<div>Quản lý đơn hàng nhà hàng</div>}
                    />
                </Route>
            </Route>

            {/* DEFAULT */}
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? getDashboardPath() : "/login"} replace />}
            />

            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? getDashboardPath() : "/login"} replace />}
            />
        </Routes>
    )
}

export default AppRoutes
