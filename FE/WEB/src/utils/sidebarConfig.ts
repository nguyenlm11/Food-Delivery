import { LayoutDashboard, List, PlusCircle, Settings, ShoppingBag, Star, Store, Tags, Ticket, Utensils, UserRound, type LucideIcon, Truck } from "lucide-react"

export interface SidebarItem {
    label: string
    path: string
    icon: LucideIcon
    children?: SidebarItem[]
}

export const buildOwnerMenus = (): SidebarItem[] => {
    return [
        {
            label: "Quản lý quán",
            path: "/owner/restaurants",
            icon: Store,
            children: [
                {
                    label: "Danh sách quán",
                    path: "/owner/restaurants",
                    icon: Store,
                },
                {
                    label: "Đăng ký quán mới",
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
            label: "Quán ăn",
            path: `${base}/overview`,
            icon: LayoutDashboard,
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
            icon: ShoppingBag,
            children: [
                {
                    label: "Đơn hàng",
                    path: `${base}/orders`,
                    icon: ShoppingBag,
                },
                {
                    label: "Đánh giá",
                    path: `${base}/reviews`,
                    icon: Star,
                },
            ],
        },
        {
            label: "Menu & bán hàng",
            path: `${base}/menus`,
            icon: Utensils,
            children: [
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
    ]
}

export const sidebarMenus: Record<string, SidebarItem[]> = {
    ADMIN: [
        {
            label: "Tổng quan",
            path: "/admin",
            icon: LayoutDashboard,
        },
        {
            label: "Người dùng",
            path: "/admin/users",
            icon: UserRound,
            children: [
                {
                    label: "Khách hàng",
                    path: "/admin/users/customers",
                    icon: UserRound,
                },
                {
                    label: "Đối tác",
                    path: "/admin/users/owners",
                    icon: UserRound,
                },
                {
                    label: "Tài xế",
                    path: "/admin/users/drivers",
                    icon: UserRound,
                },
                {
                    label: "Thêm tài xế",
                    path: "/admin/users/drivers/create",
                    icon: PlusCircle,
                },
            ],
        },
        {
            label: "Danh mục",
            path: "/admin/food-categories",
            icon: Tags,
            children: [
                {
                    label: "Quán ăn",
                    path: "/admin/restaurants",
                    icon: Store,
                },
                {
                    label: "Danh mục món",
                    path: "/admin/food-categories",
                    icon: Tags,
                },
                {
                    label: "Mã giảm giá",
                    path: "/admin/vouchers",
                    icon: Ticket,
                },
            ],
        },
        {
            label: "Vận chuyển",
            path: "/admin/ship-fees",
            icon: Truck,
        },
    ],

    RESTAURANT: [
        {
            label: "Tổng quan",
            path: "/restaurant",
            icon: LayoutDashboard,
        },
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
}
