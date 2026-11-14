import { Route } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"
import OwnerRestaurantPage from "@/pages/owner/restaurants/RestaurantPage"
import OwnerRestaurantRoute from "./guards/OwnerRestaurantRoute"

const ownerRoutes = (
    <Route element={<DashboardLayout />}>
        <Route path="/owner" element={<div>Tổng quan Owner</div>} />
        <Route path="/owner/restaurants" element={<OwnerRestaurantPage />} />
        <Route path="/owner/restaurants/create" element={<div>Thêm nhà hàng</div>} />
        <Route element={<OwnerRestaurantRoute />}>
            <Route path="/owner/restaurants/:restaurantId/overview" element={<div>Tổng quan quán</div>} />
            <Route path="/owner/restaurants/:restaurantId/details" element={<div>Chi tiết quán</div>} />
            <Route path="/owner/restaurants/:restaurantId/orders" element={<div>Quản lý đơn hàng</div>} />
            <Route path="/owner/restaurants/:restaurantId/reviews" element={<div>Quản lý đánh giá</div>} />
            <Route path="/owner/restaurants/:restaurantId/menus" element={<div>Quản lý thực đơn</div>} />
            <Route path="/owner/restaurants/:restaurantId/menus/create" element={<div>Thêm thực đơn</div>} />
            <Route path="/owner/restaurants/:restaurantId/foods" element={<div>Quản lý món ăn</div>} />
            <Route path="/owner/restaurants/:restaurantId/foods/create" element={<div>Thêm món ăn</div>} />
            <Route path="/owner/restaurants/:restaurantId/modifier-groups" element={<div>Quản lý nhóm tùy chọn</div>} />
            <Route path="/owner/restaurants/:restaurantId/modifier-groups/create" element={<div>Thêm nhóm tùy chọn</div>} />
            <Route path="/owner/restaurants/:restaurantId/vouchers" element={<div>Quản lý mã giảm giá</div>} />
            <Route path="/owner/restaurants/:restaurantId/vouchers/create" element={<div>Thêm mã giảm giá</div>} />
        </Route>
    </Route>
)

export default ownerRoutes
