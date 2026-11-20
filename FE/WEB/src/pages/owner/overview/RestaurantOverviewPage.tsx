import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed } from "lucide-react"
import { mockFoods, mockMenus, mockModifierGroups } from "../restaurants/mockData"

const STATS = [
    { label: "Thực đơn", value: mockMenus.filter(menu => menu.status !== "DELETED").length, unit: "thực đơn" },
    { label: "Món ăn", value: mockFoods.filter(food => food.status !== "DELETED").length, unit: "món" },
    { label: "Nhóm tùy chọn", value: mockModifierGroups.filter(group => group.status !== "DELETED").length, unit: "nhóm" },
    { label: "Đang bán", value: mockFoods.filter(food => food.status === "ACTIVE").length, unit: "món" }
]

function RestaurantOverviewPage() {
    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Tổng quan quán"
                description="Số liệu vận hành hiện tại của nhà hàng bạn đang quản lý."
            />

            <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="rounded-xl border bg-card p-4">
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.unit}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="border-b border-border-default px-4 py-3">
                        <h3 className="text-sm font-semibold text-foreground">Món ăn theo thực đơn</h3>
                    </div>

                    <ul className="divide-y divide-border-default">
                        {mockMenus
                            .filter(menu => menu.status !== "DELETED")
                            .map((menu) => {
                                const foods = mockFoods.filter(food => food.menuId === menu._id && food.status !== "DELETED")

                                return (
                                    <li key={menu._id} className="flex items-center gap-3 px-4 py-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-strong">
                                            <UtensilsCrossed className="size-4" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">{menu.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{menu.description || "—"}</p>
                                        </div>

                                        <Badge tone={menu.status === "ACTIVE" ? "success" : "warning"}>
                                            {menu.status === "ACTIVE" ? "Khả dụng" : "Tạm ẩn"}
                                        </Badge>

                                        <span className="w-16 shrink-0 text-right text-sm text-muted-foreground">
                                            {foods.length} món
                                        </span>
                                    </li>
                                )
                            })}
                    </ul>
                </div>
            </section>
        </div>
    )
}

export default RestaurantOverviewPage
