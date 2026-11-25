import ConfirmDialog from "@/components/common/ConfirmDialog"
import PageHeader from "@/components/common/PageHeader"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import socket from "@/services/core/socket"
import { approveRestaurant, deleteRestaurant, getAllRestaurants, rejectRestaurant } from "@/services/restaurant.service"
import type { ActionTarget, AdminAction } from "@/types/api"
import type { GetRestaurantsQuery, RestaurantFilterValues } from "@/types/restaurant.type"
import { restaurantActionConfig } from "@/utils/actionConfig"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { approvalStatusConfig, restaurantStatusConfig } from "@/utils/statusConfig"
import { Check, Store, Trash, X } from "lucide-react"
import { useEffect, useState } from "react"

function RestaurantPage() {
    const [query, setQuery] = useState<GetRestaurantsQuery>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "approve", title: "" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const restaurants = data?.data.restaurants ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllRestaurants(query)
                setData(response)
            }
            catch (error) {
                setData(null)
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
            finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [query, reloadKey])

    useEffect(() => {
        const handleReload = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("restaurant:created", handleReload)
        socket.on("restaurant:updated", handleReload)
        socket.on("restaurant:deleted", handleReload)
        socket.on("connect", handleReload)

        return () => {
            socket.off("restaurant:created", handleReload)
            socket.off("restaurant:updated", handleReload)
            socket.off("restaurant:deleted", handleReload)
            socket.off("connect", handleReload)
        }
    }, [])

    const handleSort = (key: string) => {
        setIsLoading(true)
        setQuery((current) => ({
            ...current,
            sortBy: key,
            sortOrder: current.sortBy === key ? (current.sortOrder === "asc" ? "desc" : "asc") : "asc",
            page: 1
        }))
    }

    const handleSearch = () => {
        setIsLoading(true)
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
    }

    const handleApplyFilter = (values: RestaurantFilterValues) => {
        setIsLoading(true)
        setQuery((current) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            approvalStatus: values.approvalStatus === "all" ? undefined : values.approvalStatus,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        setIsLoading(true)
        if (key === "search") {
            setQuery((current) => ({ ...current, search: "", page: 1 }))
        }
        if (key === "status") {
            setQuery((current) => ({ ...current, status: undefined, page: 1 }))
        }
        if (key === "approvalStatus") {
            setQuery((current) => ({ ...current, approvalStatus: undefined, page: 1 }))
        }
    }

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async (reason: string) => {
        if (actionTarget.action === "reject" && !reason.trim()) {
            setResult({ isOpen: true, isSuccess: false, message: "Vui lòng nhập lý do từ chối." })
            setConfirm((current) => ({ ...current, isOpen: false }))
            return
        }

        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            switch (actionTarget.action) {
                case "approve":
                    await approveRestaurant(actionTarget.id)
                    break
                case "reject":
                    await rejectRestaurant(actionTarget.id, reason.trim())
                    break
                case "delete":
                    await deleteRestaurant(actionTarget.id)
                    break
            }
            setResult({
                isOpen: true,
                isSuccess: true,
                message: restaurantActionConfig[actionTarget.action].message
            })
        }
        catch (error) {
            const response = getErrorData(error)
            setResult({
                isOpen: true,
                isSuccess: false,
                message: getLocalizedErrorMessage(response)
            })
        }
        finally {
            setConfirm((current) => ({ ...current, isProcessing: false, isOpen: false }))
        }
    }

    const rows = restaurants.map((restaurant: any) => {
        const restaurantStatus = restaurantStatusConfig[restaurant.status]
        const restaurantApprovalStatus = approvalStatusConfig[restaurant.approvalStatus]
        return {
            id: restaurant._id,
            cells: [
                <div className="min-w-0">
                    <span className="block whitespace-nowrap font-medium text-foreground">{restaurant.name}</span>
                    <span className="block max-w-64 truncate whitespace-nowrap text-xs text-muted-foreground">{restaurant.address}</span>
                </div>,
                <span>{restaurant.ownerId?.userId?.fullname}</span>,
                <span>{restaurant.phone}</span>,
                <span>{restaurant.openTime} - {restaurant.closeTime}</span>,
                <Badge tone={restaurantStatus.tone}>{restaurantStatus.label}</Badge>,
                <Badge tone={restaurantApprovalStatus.tone}>{restaurantApprovalStatus.label}</Badge>,
                <RowActions
                    actions={[
                        restaurant.approvalStatus === "PENDING" && {
                            label: "Duyệt",
                            icon: <Check className="size-4" />,
                            onClick: () => openAction(restaurant._id, restaurant.name, "approve", "Duyệt")
                        },
                        restaurant.approvalStatus === "PENDING" && {
                            label: "Từ chối",
                            icon: <X className="size-4" />,
                            onClick: () => openAction(restaurant._id, restaurant.name, "reject", "Từ chối")
                        },
                        restaurant.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(restaurant._id, restaurant.name, "delete", "Xóa")
                        },
                    ]}
                />
            ]
        }
    })

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Quán ăn"
                description="Quản lý quán ăn của hệ thống."
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${restaurantStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.approvalStatus !== undefined ? [{ key: "approvalStatus", label: `Trạng thái xác nhận: ${approvalStatusConfig[query.approvalStatus]?.label || query.approvalStatus}` }] : [])
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
                            values={{
                                status: query.status ?? "all",
                                approvalStatus: query.approvalStatus ?? "all"
                            }}
                            groups={[
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Hoạt động", value: "ACTIVE" },
                                        { label: "Không hoạt động", value: "INACTIVE" },
                                        { label: "Đã đóng cửa", value: "CLOSED" },
                                        { label: "Đã xóa", value: "DELETED" }
                                    ]
                                },
                                {
                                    key: "approvalStatus",
                                    label: "Trạng thái xác nhận",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Đang chờ", value: "PENDING" },
                                        { label: "Đã xác nhận", value: "APPROVED" },
                                        { label: "Từ chối", value: "REJECTED" }
                                    ]
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên quán", className: "w-64", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Chủ quán", className: "w-36" },
                        { label: "Số điện thoại", className: "w-40 text-center" },
                        { label: "Giờ mở cửa", className: "w-32 text-center" },
                        { label: "Trạng thái", className: "w-32 text-center", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Duyệt", className: "w-32 text-center", sortKey: "approvalStatus", sortOrder: query.sortBy === "approvalStatus" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage="Không có quán ăn nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác."
                    emptyIcon={Store}
                />

                {(pagination && restaurants.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={(page) => { setIsLoading(true); setQuery((current) => ({ ...current, page })) }}
                        onPageSizeChange={(size) => { setIsLoading(true); setQuery((current) => ({ ...current, limit: size, page: 1 })) }}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name || "chủ nhà hàng"}?`}
                description={restaurantActionConfig[actionTarget.action].description}
                confirmLabel={actionTarget.title}
                reasonLabel={restaurantActionConfig[actionTarget.action].reasonLabel}
                reasonPlaceholder="Nhập lý do từ chối..."
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

export default RestaurantPage
