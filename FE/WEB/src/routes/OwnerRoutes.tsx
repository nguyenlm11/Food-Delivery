import { Route } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"
import OwnerRestaurantPage from "@/pages/owner/restaurants/RestaurantPage"
import CreateRestaurantPage from "@/pages/owner/restaurants/CreateRestaurantPage"
import VoucherPage from "@/pages/owner/vouchers/VoucherPage"
import OwnerRestaurantRoute from "./guards/OwnerRestaurantRoute"
import RestaurantOverviewPage from "@/pages/owner/overview/RestaurantOverviewPage"
import RestaurantDetailsPage from "@/pages/owner/details/RestaurantDetailsPage"
import MenuPage from "@/pages/owner/menus/MenuPage"
import FoodPage from "@/pages/owner/foods/FoodPage"
import ModifierGroupPage from "@/pages/owner/modifier-groups/ModifierGroupPage"

const ownerRoutes = (
    <Route element={<DashboardLayout />}>
        <Route path="/owner" element={<h1 className="text-title font-semibold">Tổng quan Owner</h1>} />
        <Route path="/owner/restaurants" element={<OwnerRestaurantPage />} />
        <Route path="/owner/restaurants/create" element={<CreateRestaurantPage />} />
        <Route element={<OwnerRestaurantRoute />}>
            <Route path="/owner/restaurants/:restaurantId/overview" element={<RestaurantOverviewPage />} />
            <Route path="/owner/restaurants/:restaurantId/details" element={<RestaurantDetailsPage />} />
            <Route path="/owner/restaurants/:restaurantId/orders" element={<h1 className="text-title font-semibold">Quản lý đơn hàng</h1>} />
            <Route path="/owner/restaurants/:restaurantId/reviews" element={<h1 className="text-title font-semibold">Quản lý đánh giá</h1>} />
            <Route path="/owner/restaurants/:restaurantId/menus" element={<MenuPage />} />
            <Route path="/owner/restaurants/:restaurantId/foods" element={<FoodPage />} />
            <Route path="/owner/restaurants/:restaurantId/modifier-groups" element={<ModifierGroupPage />} />
            <Route path="/owner/restaurants/:restaurantId/vouchers" element={<VoucherPage />} />
            <Route path="/owner/restaurants/:restaurantId/payments" element={<h1 className="text-title font-semibold">Quản lý thanh toán</h1>} />
            <Route path="/owner/restaurants/:restaurantId/revenues" element={<h1 className="text-title font-semibold">Quản lý doanh thu</h1>} />
            <Route path="/owner/restaurants/:restaurantId/reports" element={<h1 className="text-title font-semibold">Quản lý báo cáo</h1>} />
        </Route>
    </Route>
)

export default ownerRoutes
