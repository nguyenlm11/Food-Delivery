import {
    LayoutDashboard,
    Users,
    UserRound,
    Store,
    Utensils,
    ShoppingBag,
    Ticket,
    Tags,
    type LucideIcon,
} from "lucide-react"

export interface SidebarItem {
    label: string
    path: string
    icon: LucideIcon
    children?: SidebarItem[]
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
            icon: Users,
            children: [
                {
                    label: "Khách hàng",
                    path: "/admin/users/customers",
            icon: UserRound,
                },
                {
                    label: "Chủ nhà hàng",
                    path: "/admin/users/owners",
                    icon: UserRound,
                },
                {
                    label: "Tài xế",
                    path: "/admin/users/drivers",
                    icon: UserRound,
                },
            ],
        },
        {
            label: "Nhà hàng",
            path: "/admin/restaurants",
            icon: Store,
        },
        {
            label: "Danh mục",
            path: "/admin/food-categories",
            icon: Tags,
        },
        {
            label: "Đơn hàng",
            path: "/admin/orders",
            icon: ShoppingBag,
        },
        {
            label: "Voucher",
            path: "/admin/vouchers",
            icon: Ticket,
        },
    ],

    OWNER: [
        {
            label: "Tổng quan",
            path: "/owner",
            icon: LayoutDashboard,
        },
        {
            label: "Nhà hàng của tôi",
            path: "/owner/restaurants",
            icon: Store,
        },
    ],

    RESTAURANT: [
        {
            label: "Tổng quan",
            path: "/restaurant",
            icon: LayoutDashboard,
        },
        {
            label: "Menu",
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
