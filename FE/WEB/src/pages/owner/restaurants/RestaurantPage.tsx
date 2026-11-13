import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from "@/components/data-table/DataTable"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMyRestaurants } from "@/services/restaurant.service"
import { buildOwnerResourcePath } from "@/utils/restaurantPath"
import { approvalStatusConfig, restaurantStatusConfig } from "@/utils/statusConfig"
import { Plus, Store } from "lucide-react"

function OwnerRestaurantPage() {
    const navigate = useNavigate()
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getMyRestaurants()
                setData(response)
            }
            catch {
                setData(null)
            }
            finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const restaurants = data?.data ?? []

    const rows = restaurants.map((restaurant: any) => {
        const statusItem = restaurantStatusConfig[restaurant.status] ?? restaurantStatusConfig.INACTIVE
        const approvalItem = approvalStatusConfig[restaurant.approvalStatus] ?? approvalStatusConfig.PENDING

        return {
            id: restaurant._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {restaurant.logoImage && <AvatarImage src={restaurant.logoImage} alt={restaurant.name} />}
                        <AvatarFallback name={restaurant.name}>{(restaurant.name ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <span className="block whitespace-nowrap font-medium text-foreground">{restaurant.name}</span>
                        <span className="block max-w-64 truncate whitespace-nowrap text-xs text-muted-foreground">
                            {restaurant.address}
                        </span>
                    </div>
                </div>,
                <span className="block whitespace-nowrap text-muted-foreground">{restaurant.phone}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">
                    {restaurant.openTime} - {restaurant.closeTime}
                </span>,
                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>,
                <Badge tone={approvalItem.tone}>{approvalItem.label}</Badge>,
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(buildOwnerResourcePath(restaurant._id, "overview"))}
                >
                    Quản lý
                </Button>
            ]
        }
    })

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Nhà hàng của tôi</h2>
                    <p className="text-sm text-text-secondary">
                        Chọn một nhà hàng để quản lý thực đơn, món ăn, nhóm tùy chọn và mã giảm giá.
                    </p>
                </div>

                <Button onClick={() => navigate("/owner/restaurants/create")}>
                    <Plus className="size-4" />
                    Thêm nhà hàng
                </Button>
            </div>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <DataTable
                    headers={[
                        { label: "Nhà hàng", className: "min-w-64" },
                        { label: "Số điện thoại", className: "min-w-40" },
                        { label: "Giờ mở cửa", className: "min-w-32" },
                        { label: "Trạng thái", className: "min-w-32" },
                        { label: "Duyệt", className: "min-w-32" },
                        { label: "", className: "w-32" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={6}
                    emptyMessage="Chưa có nhà hàng nào"
                    emptyDescription="Tạo nhà hàng đầu tiên để bắt đầu quản lý thực đơn."
                    emptyIcon={Store}
                />
            </section>
        </div>
    )
}

export default OwnerRestaurantPage
