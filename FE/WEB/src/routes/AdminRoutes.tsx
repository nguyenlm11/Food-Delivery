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
        <Route path="/admin" element={<h1 className="text-title font-semibold">Tổng quan</h1>} />
        <Route path="/admin/users" element={<h1 className="text-title font-semibold">Quản lý người dùng</h1>} />
        <Route path="/admin/users/customers" element={<CustomerPage />} />
        <Route path="/admin/users/owners" element={<OwnerPage />} />
        <Route path="/admin/users/drivers" element={<h1 className="text-title font-semibold">Quản lý tài xế</h1>} />
        <Route path="/admin/users/drivers/create" element={<h1 className="text-title font-semibold">Thêm tài xế</h1>} />
        <Route path="/admin/restaurants" element={<RestaurantPage />} />
        <Route path="/admin/food-categories" element={<CategoryPage />} />
        <Route path="/admin/ship-fees" element={<ShipFeePage />} />
        <Route path="/admin/vouchers" element={<VoucherPage />} />
    </Route>
)

export default adminRoutes
