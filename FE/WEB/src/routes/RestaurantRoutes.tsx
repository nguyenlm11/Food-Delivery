import { Route } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"

const restaurantRoutes = (
    <Route element={<DashboardLayout />}>
        <Route path="/restaurant" element={<h1 className="text-title font-semibold">Tổng quan nhà hàng</h1>} />
        <Route path="/restaurant/menu" element={<h1 className="text-title font-semibold">Quản lý menu</h1>} />
        <Route path="/restaurant/orders" element={<h1 className="text-title font-semibold">Quản lý đơn hàng nhà hàng</h1>} />
    </Route>
)

export default restaurantRoutes
