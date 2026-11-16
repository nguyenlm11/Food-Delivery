import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { getAllRestaurants } from "@/services/restaurant.service"
import type { GetAllRestaurantParams } from "@/types/restaurants"
import { approvalStatusConfig, restaurantStatusConfig } from "@/utils/statusConfig"
import { Store } from "lucide-react"
import { useEffect, useState } from "react"

function RestaurantPage() {
    const [query, setQuery] = useState<GetAllRestaurantParams>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")


    const restaurants = data?.data.restaurants ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllRestaurants(query)
                setData(response)
            }
            catch {
                setData(null)
            }
            finally {
                setIsLoading(false)
                setReloadKey(0)
            }
        }

        loadData()
    }, [query, reloadKey])

    const handleSearch = () => {
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
        setSearchInput("")
    }

    const handleApplyFilter = () => {
        console.log(query)
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setQuery((current) => ({ ...current, search: "", page: 1 }))
            return
        }
    }

    const rows = restaurants.map((restaurant: any) => {
        const statusItem = restaurantStatusConfig[restaurant.status] ?? restaurantStatusConfig.INACTIVE
        const approvalItem = approvalStatusConfig[restaurant.approvalStatus] ?? approvalStatusConfig.PENDING

        return {
            id: restaurant._id,
            cells: [
                <div className="min-w-0">
                    <span className="block whitespace-nowrap font-medium text-foreground">{restaurant.name}</span>
                    <span className="block max-w-64 truncate whitespace-nowrap text-xs text-muted-foreground">
                        {restaurant.address}
                    </span>
                </div>,
                <span>{restaurant.ownerId?.userId?.fullname}</span>,
                <span>{restaurant.phone}</span>,
                <span>{restaurant.openTime} - {restaurant.closeTime}</span>,
                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>,
                <Badge tone={statusItem.tone}>{approvalItem.label}</Badge>,
                <RowActions
                    label={restaurant.name}
                    actions={[]}
                />
            ]
        }
    })

    return (
        <div>
            <div>
                <div>
                    <h2>Quán ăn</h2>
                    <p>
                        Chưa nghĩ ra
                    </p>
                </div>
            </div>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên hoặc số điện thoại..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <Filter
                            values={{}}
                            groups={[]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên quán", className: "min-w-64" },
                        { label: "Chủ quán", className: "min-w-36" },
                        { label: "Số điện thoại", className: "min-w-40" },
                        { label: "Giờ mở cửa", className: "min-w-32" },
                        { label: "Trạng thái", className: "min-w-32" },
                        { label: "Duyệt", className: "min-w-32" },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={6}
                    emptyMessage="Không có quán ăn nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác."
                    emptyIcon={Store}
                />

                {(!isLoading && pagination && restaurants.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                        onPageSizeChange={(size) => setQuery((current) => ({ ...current, limit: size, page: 1 }))}
                    />
                )}
            </section>
        </div>
    )
}

export default RestaurantPage
