import { LayoutDashboard, List, PlusCircle, Settings, ShoppingBag, Store, Tags, Ticket, Utensils, UserRound, Users, type LucideIcon, Truck } from "lucide-react"

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
            label: "Quán ăn",
            path: "/admin/restaurants",
            icon: Store,
        },
        {
            label: "Danh mục",
            path: "/admin/food-categories",
            icon: Tags
        },
        {
            label: "Phí vận chuyển",
            path: "/admin/ship-fees",
            icon: Truck,
        },
        {
            label: "Mã giảm giá",
            path: "/admin/vouchers",
            icon: Ticket,
        }
    ],

    OWNER: [
        {
            label: "Tổng quan",
            path: "/owner",
            icon: LayoutDashboard,
        },
        {
            label: "Quán ăn của tôi",
            path: "/owner/restaurants",
            icon: Store,
            children: [
                {
                    label: "Danh sách",
                    path: "/owner/restaurants",
                    icon: List,
                },
                {
                    label: "Thêm quán ăn",
                    path: "/owner/restaurants/create",
                    icon: PlusCircle,
                },
            ],
        },
        {
            label: "Thực đơn",
            path: "/owner/menus",
            icon: Utensils,
            children: [
                {
                    label: "Danh sách",
                    path: "/owner/menus",
                    icon: List,
                },
                {
                    label: "Thêm thực đơn",
                    path: "/owner/menus/create",
                    icon: PlusCircle,
                },
            ],
        },
        {
            label: "Món ăn",
            path: "/owner/foods",
            icon: Utensils,
            children: [
                {
                    label: "Danh sách",
                    path: "/owner/foods",
                    icon: List,
                },
                {
                    label: "Thêm món ăn",
                    path: "/owner/foods/create",
                    icon: PlusCircle,
                },
            ],
        },
        {
            label: "Nhóm tùy chọn",
            path: "/owner/modifier-groups",
            icon: Settings,
            children: [
                {
                    label: "Danh sách",
                    path: "/owner/modifier-groups",
                    icon: List,
                },
                {
                    label: "Thêm nhóm tùy chọn",
                    path: "/owner/modifier-groups/create",
                    icon: PlusCircle,
                },
            ],
        },
        {
            label: "Mã giảm giá",
            path: "/owner/vouchers",
            icon: Ticket,
            children: [
                {
                    label: "Danh sách",
                    path: "/owner/vouchers",
                    icon: List,
                },
                {
                    label: "Thêm mã",
                    path: "/owner/vouchers/create",
                    icon: PlusCircle,
                },
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
