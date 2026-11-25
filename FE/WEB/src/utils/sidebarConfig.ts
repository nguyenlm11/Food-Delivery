import { LayoutDashboard, List, PlusCircle, Settings, ShoppingBag, Star, Store, Tags, Ticket, Utensils, UserRound, type LucideIcon, Truck } from "lucide-react"

export interface SidebarItem {
    label: string
    path: string
    icon?: LucideIcon | null
    children?: SidebarItem[]
}

export const buildOwnerMenus = (): SidebarItem[] => {
    return [
        {
            label: "Tổng quan",
            path: "/owner/overview",
            icon: LayoutDashboard,
        },
        {
            label: "Quản lý",
            path: "/owner/restaurants",
            icon: Store,
            children: [
                {
                    label: "Danh sách quán",
                    path: "/owner/restaurants",
                    icon: Store,
                },
                {
                    label: "Đăng ký quán",
                    path: "/owner/restaurants/create",
                    icon: PlusCircle,
                },
            ],
        },
    ]
}

export const buildRestaurantMenus = (restaurantId: string): SidebarItem[] => {
    const base = `/owner/restaurants/${restaurantId}`

    return [
        {
            label: "Quản lý quán",
            path: `${base}/overview`,
            children: [
                {
                    label: "Tổng quan",
                    path: `${base}/overview`,
                    icon: LayoutDashboard,
                },
                {
                    label: "Chi tiết quán",
                    path: `${base}/details`,
                    icon: Store,
                },
            ],
        },
        {
            label: "Vận hành",
            path: `${base}/orders`,
            children: [
                {
                    label: "Đơn hàng",
                    path: `${base}/orders`,
                    icon: ShoppingBag,
                },
                {
                    label: "Thực đơn",
                    path: `${base}/menus`,
                    icon: Utensils,
                },
                {
                    label: "Món ăn",
                    path: `${base}/foods`,
                    icon: List,
                },
                {
                    label: "Nhóm tùy chọn",
                    path: `${base}/modifier-groups`,
                    icon: Settings,
                },
                {
                    label: "Mã giảm giá",
                    path: `${base}/vouchers`,
                    icon: Ticket,
                },
            ],
        },
        {
            label: "Tài chính & Báo cáo",
            path: `${base}/payments`,
            children: [
                {
                    label: "Thanh toán",
                    path: `${base}/payments`,
                    icon: Star,
                },
                {
                    label: "Doanh thu",
                    path: `${base}/revenues`,
                    icon: Ticket,
                },
                {
                    label: "Báo cáo",
                    path: `${base}/reports`,
                    icon: Ticket,
                },
            ],
        }
    ]
}

export const sidebarMenus: Record<string, SidebarItem[]> = {
    ADMIN: [
        {
            label: "Tổng quan",
            path: "/admin",
            icon: LayoutDashboard
        },
        {
            label: "Quản lý",
            path: "/admin",
            children: [
                {
                    label: "Khách hàng",
                    path: "/admin/users/customers",
                    icon: UserRound,
                },
                {
                    label: "Chủ quán",
                    path: "/admin/users/owners",
                    icon: UserRound,
                },
                {
                    label: "Tài xế",
                    path: "/admin/users/drivers",
                    icon: Truck,
                },
                {
                    label: "Quán ăn",
                    path: "/admin/restaurants",
                    icon: Store,
                },
            ],
        },
        {
            label: "Hệ thống",
            path: "/admin",
            children: [
                {
                    label: "Danh mục",
                    path: "/admin/food-categories",
                    icon: Tags,
                },
                {
                    label: "Mã giảm giá",
                    path: "/admin/vouchers",
                    icon: Ticket,
                },
                {
                    label: "Vận chuyển",
                    path: "/admin/ship-fees",
                    icon: Truck,
                }
            ],
        },
    ],

    RESTAURANT: [
        {
            label: "Tổng quan",
            path: "/restaurant",
            icon: LayoutDashboard,
        },
        {
            label: "Vận hành",
            path: "/restaurant/menu",
            children: [
                {
                    label: "Thực đơn",
                    path: "/restaurant/menu",
                    icon: Utensils,
                },
                {
                    label: "Đơn hàng",
                    path: "/restaurant/orders",
                    icon: ShoppingBag,
                },
            ],
        },
    ],
}