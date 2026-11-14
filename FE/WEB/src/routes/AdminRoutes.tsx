import { Route } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"
import CategoryPage from "@/pages/admin/categories/CategoryPage"
import CustomerPage from "@/pages/admin/customers/CustomerPage"
import OwnerPage from "@/pages/admin/owners/OwnerPage"
import RestaurantPage from "@/pages/admin/restaurants/RestaurantPage"
import ShipFeePage from "@/pages/admin/ship-fees/ShipFeePage"
import VoucherPage from "@/pages/admin/vouchers/VoucherPage"

const adminRoutes = (
    <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<div>Tổng quan</div>} />
        <Route path="/admin/users" element={<div>Quản lý người dùng</div>} />
        <Route path="/admin/users/customers" element={<CustomerPage />} />
        <Route path="/admin/users/owners" element={<OwnerPage />} />
        <Route path="/admin/users/drivers" element={<div>Quản lý tài xế</div>} />
        <Route path="/admin/users/drivers/create" element={<div>Thêm tài xế</div>} />
        <Route path="/admin/restaurants" element={<RestaurantPage />} />
        <Route path="/admin/food-categories" element={<CategoryPage />} />
        <Route path="/admin/ship-fees" element={<ShipFeePage />} />
        <Route path="/admin/vouchers" element={<VoucherPage />} />
    </Route>
)

export default adminRoutes
