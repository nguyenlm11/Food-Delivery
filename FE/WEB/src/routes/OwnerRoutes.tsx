import { Route } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"
import OwnerRestaurantPage from "@/pages/owner/restaurants/RestaurantPage"
import OwnerRestaurantRoute from "./guards/OwnerRestaurantRoute"

const ownerRoutes = (
    <Route element={<DashboardLayout />}>
        <Route path="/owner" element={<h1 className="text-title font-semibold">Tổng quan Owner</h1>} />
        <Route path="/owner/restaurants" element={<OwnerRestaurantPage />} />
        <Route path="/owner/restaurants/create" element={<h1 className="text-title font-semibold">Thêm nhà hàng</h1>} />
        <Route element={<OwnerRestaurantRoute />}>
            <Route path="/owner/restaurants/:restaurantId/overview" element={<h1 className="text-title font-semibold">Tổng quan quán</h1>} />
            <Route path="/owner/restaurants/:restaurantId/details" element={<h1 className="text-title font-semibold">Chi tiết quán</h1>} />
            <Route path="/owner/restaurants/:restaurantId/orders" element={<h1 className="text-title font-semibold">Quản lý đơn hàng</h1>} />
            <Route path="/owner/restaurants/:restaurantId/reviews" element={<h1 className="text-title font-semibold">Quản lý đánh giá</h1>} />
            <Route path="/owner/restaurants/:restaurantId/menus" element={<h1 className="text-title font-semibold">Quản lý thực đơn</h1>} />
            <Route path="/owner/restaurants/:restaurantId/menus/create" element={<h1 className="text-title font-semibold">Thêm thực đơn</h1>} />
            <Route path="/owner/restaurants/:restaurantId/foods" element={<h1 className="text-title font-semibold">Quản lý món ăn</h1>} />
            <Route path="/owner/restaurants/:restaurantId/foods/create" element={<h1 className="text-title font-semibold">Thêm món ăn</h1>} />
            <Route path="/owner/restaurants/:restaurantId/modifier-groups" element={<h1 className="text-title font-semibold">Quản lý nhóm tùy chọn</h1>} />
            <Route path="/owner/restaurants/:restaurantId/modifier-groups/create" element={<h1 className="text-title font-semibold">Thêm nhóm tùy chọn</h1>} />
            <Route path="/owner/restaurants/:restaurantId/vouchers" element={<h1 className="text-title font-semibold">Quản lý mã giảm giá</h1>} />
            <Route path="/owner/restaurants/:restaurantId/vouchers/create" element={<h1 className="text-title font-semibold">Thêm mã giảm giá</h1>} />
        </Route>
    </Route>
)

export default ownerRoutes
