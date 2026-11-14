import { Route } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"

const restaurantRoutes = (
    <Route element={<DashboardLayout />}>
        <Route path="/restaurant" element={<div>Tổng quan nhà hàng</div>} />
        <Route path="/restaurant/menu" element={<div>Quản lý menu</div>} />
        <Route path="/restaurant/orders" element={<div>Quản lý đơn hàng nhà hàng</div>} />
    </Route>
)

export default restaurantRoutes
