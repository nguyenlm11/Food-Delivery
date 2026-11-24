import PageHeader from "@/components/common/PageHeader"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteMenu, getMenusByRestaurant, updateMenuStatus } from "@/services/menu.service"
import socket from "@/services/core/socket"
import type { GetRestaurantMenusQuery, MenuFilterValues } from "@/types/menu.type"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { menuStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Trash, Utensils } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import CreateMenuModal from "./CreateMenuModal"
import type { ActionTarget, AdminAction } from "@/types/api"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import { menuActionConfig } from "@/utils/actionConfig"

function MenuPage() {
    const { restaurantId } = useParams()
    const [query, setQuery] = useState<GetRestaurantMenusQuery>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "delete", title: "" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const menus = data?.data?.menus ?? []
    const pagination = data?.data?.pagination

    useEffect(() => {
        if (!restaurantId) { return }

        const loadData = async () => {
            try {
                const response = await getMenusByRestaurant(restaurantId, query)
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
    }, [restaurantId, query, reloadKey])

    useEffect(() => {
        const handleReload = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("menu:created", handleReload)
        socket.on("menu:updated", handleReload)
        socket.on("menu:deleted", handleReload)
        socket.on("food:created", handleReload)
        socket.on("food:updated", handleReload)
        socket.on("food:deleted", handleReload)
        socket.on("connect", handleReload)

        return () => {
            socket.off("menu:created", handleReload)
            socket.off("menu:updated", handleReload)
            socket.off("menu:deleted", handleReload)
            socket.off("food:created", handleReload)
            socket.off("food:updated", handleReload)
            socket.off("food:deleted", handleReload)
            socket.off("connect", handleReload)
        }
    }, [])

    const handleSearch = () => {
        setIsLoading(true)
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
    }

    const handleApplyFilter = (values: MenuFilterValues) => {
        setIsLoading(true)
        setQuery((current) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        setIsLoading(true)
        if (key === "search") {
            setSearchInput("")
            setQuery((current) => ({ ...current, search: undefined, page: 1 }))
        }
        if (key === "status") {
            setQuery((current) => ({ ...current, status: undefined, page: 1 }))
        }
    }

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            switch (actionTarget.action) {
                case "hide":
                    await updateMenuStatus(actionTarget.id, "INACTIVE")
                    break
                case "restore":
                case "restoreDeleted":
                    await updateMenuStatus(actionTarget.id, "ACTIVE")
                    break
                case "delete":
                    await deleteMenu(actionTarget.id)
                    break
            }
            setResult({
                isOpen: true,
                isSuccess: true,
                message: menuActionConfig[actionTarget.action].message
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

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Thêm thực đơn
        </Button>
    )

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Thực đơn"
                description="Quản lý và cập nhật các thực đơn của quán"
                action={createButton}
            />

            <div className="flex shrink-0 flex-col gap-3 rounded-xl border bg-card p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                        <Search
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Tìm theo tên thực đơn..."
                            onSearch={handleSearch}
                        />
                    </div>

                    <Filter
                        values={{ status: query.status ?? "all" }}
                        groups={[
                            {
                                key: "status",
                                label: "Trạng thái",
                                options: [
                                    { label: "Tất cả", value: "all" },
                                    { label: "Khả dụng", value: "ACTIVE" },
                                    { label: "Tạm ẩn", value: "INACTIVE" },
                                    { label: "Đã xóa", value: "DELETED" }
                                ]
                            }
                        ]}
                        onApply={handleApplyFilter}
                    />
                </div>

                {(query.search || query.status) && (
                    <ActiveFilters
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status ? [{ key: "status", label: `Trạng thái: ${menuStatusConfig[query.status]?.label ?? query.status}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />
                )}
            </div>

            <section className="hide-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="rounded-xl border bg-card p-5">
                                <Skeleton className="h-28 w-2/3" />
                                <Skeleton className="mt-3 h-4 w-full" />
                                <Skeleton className="mt-2 h-8 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : menus.length === 0 ? (
                    <EmptyState
                        title={query.search || query.status ? "Không tìm thấy thực đơn phù hợp" : "Chưa có thực đơn nào"}
                        description={query.search || query.status ? "Thử xoá bộ lọc hoặc đổi từ khóa để xem thêm thực đơn." : "Tạo thực đơn đầu tiên để thêm món ăn vào quán."}
                        icon={Utensils}
                        action={createButton}
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {menus.map((menu: any, index: number) => {
                            const status = menuStatusConfig[menu.status]
                            const foods = menu.foods ?? []
                            return (
                                <article
                                    key={menu._id}
                                    className="card-in card-lift flex h-full flex-col rounded-xl border bg-card p-4"
                                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="line-clamp-2 min-w-0 text-lg leading-snug font-semibold text-foreground">{menu.name}</h3>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Badge tone={status?.tone ?? "neutral"}>
                                                {status?.label ?? menu.status}
                                            </Badge>
                                            <RowActions
                                                actions={[
                                                    menu.status !== "DELETED" && {
                                                        label: menu.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục",
                                                        icon: menu.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                                                        onClick: () => openAction(menu._id, menu.name, menu.status === "ACTIVE" ? "hide" : "restore", menu.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục")
                                                    },
                                                    menu.status !== "DELETED" && {
                                                        label: "Xóa",
                                                        icon: <Trash className="size-4" />,
                                                        onClick: () => openAction(menu._id, menu.name, "delete", "Xóa")
                                                    },
                                                    menu.status === "DELETED" && {
                                                        label: "Kích hoạt lại",
                                                        icon: <RotateCcw className="size-4" />,
                                                        onClick: () => openAction(menu._id, menu.name, "restoreDeleted", "Kích hoạt lại")
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-foreground">{menu.description || "Chưa có mô tả"}</p>

                                    <div className="mt-3 min-h-24 border-t border-border-default pt-3">
                                        <p className="text-eyebrow font-medium text-muted-foreground">Món ăn nổi bật</p>
                                        {foods.length > 0 ? (
                                            <ul className="mt-2 space-y-1.5">
                                                {foods.map((food: any) => (
                                                    <li key={food._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3"                                                    >
                                                        <span className="truncate text-sm text-foreground">{food.name}</span>
                                                        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                                            {`${food.platformPrice.toLocaleString("vi-VN")}đ`}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-2 text-sm text-muted-foreground">Chưa có món ăn</p>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>

            {pagination && pagination.totalPages > 1 && (
                <div className="shrink-0 rounded-xl border bg-card">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit ?? query.limit ?? 12}
                        onPageChange={(page) => { setQuery((current) => ({ ...current, page })) }}
                        onPageSizeChange={(size) => { setQuery((current) => ({ ...current, limit: size, page: 1 })) }}
                    />
                </div>
            )}

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name}?`}
                description={menuActionConfig[actionTarget.action].description}
                confirmLabel={actionTarget.title}
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />

            <CreateMenuModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </div>
    )
}

export default MenuPage
