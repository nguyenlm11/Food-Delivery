import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoginPage from "../pages/auth/LoginPage"
import DashboardLayout from "../components/layout/DashboardLayout"
import RoleRoute from "./RoleRoute"
import OwnerRestaurantRoute from "./OwnerRestaurantRoute"
import CategoryPage from "../pages/admin/categories/CategoryPage"
import ShipFeePage from "@/pages/admin/ship-fees/ShipFeePage"
import VoucherPage from "@/pages/admin/vouchers/VoucherPage"
import CustomerPage from "@/pages/admin/customers/CustomerPage"
import OwnerPage from "@/pages/admin/owners/OwnerPage"
import RestaurantPage from "@/pages/owner/restaurants/RestaurantPage"

const AppRoutes = () => {
    const { user, isAuthenticated } = useAuth()

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
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <LoginPage />}
            />

            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/admin"
                        element={<div>Tổng quan</div>}
                    />
                    <Route
                        path="/admin/users"
                        element={<div>Quản lý người dùng</div>}
                    />
                    <Route
                        path="/admin/users/customers"
                        element={<CustomerPage />}
                    />
                    <Route
                        path="/admin/users/owners"
                        element={<OwnerPage />}
                    />
                    <Route
                        path="/admin/users/drivers"
                        element={<div>Quản lý tài xế</div>}
                    />
                    <Route
                        path="/admin/users/drivers/create"
                        element={<div>Thêm tài xế</div>}
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
                        path="/admin/ship-fees"
                        element={<ShipFeePage />}
                    />
                    <Route
                        path="/admin/vouchers"
                        element={<VoucherPage />}
                    />
                </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={["OWNER"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/owner"
                        element={<div>Tổng quan Owner</div>}
                    />
                    <Route
                        path="/owner/restaurants"
                        element={<RestaurantPage />}
                    />
                    <Route
                        path="/owner/restaurants/create"
                        element={<div>Thêm nhà hàng</div>}
                    />
                    <Route element={<OwnerRestaurantRoute />}>
                        <Route
                            path="/owner/restaurants/:restaurantId/overview"
                            element={<div>Tổng quan quán</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/details"
                            element={<div>Chi tiết quán</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/orders"
                            element={<div>Quản lý đơn hàng</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/reviews"
                            element={<div>Quản lý đánh giá</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/menus"
                            element={<div>Quản lý thực đơn</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/menus/create"
                            element={<div>Thêm thực đơn</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/foods"
                            element={<div>Quản lý món ăn</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/foods/create"
                            element={<div>Thêm món ăn</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/modifier-groups"
                            element={<div>Quản lý nhóm tùy chọn</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/modifier-groups/create"
                            element={<div>Thêm nhóm tùy chọn</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/vouchers"
                            element={<div>Quản lý mã giảm giá</div>}
                        />
                        <Route
                            path="/owner/restaurants/:restaurantId/vouchers/create"
                            element={<div>Thêm mã giảm giá</div>}
                        />
                    </Route>
                </Route>
            </Route>

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
