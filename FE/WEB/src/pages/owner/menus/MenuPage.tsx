import PageHeader from "@/components/common/PageHeader"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteMenu, getMenus, restoreMenu, updateMenuStatus } from "@/services/menu.service"
import socket from "@/services/core/socket"
import type { GetMenusQuery, MenuFilterValues } from "@/types/menu.type"
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
    const [query, setQuery] = useState<GetMenusQuery>({})
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
                const response = await getMenus({ ...query, restaurantId })
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
                    await updateMenuStatus(actionTarget.id, "ACTIVE")
                    break
                case "restoreDeleted":
                    await restoreMenu(actionTarget.id)
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

    const rows = menus.map((menu: any) => {
        const status = menuStatusConfig[menu.status]
        const foods = menu.foods ?? []

        return {
            id: menu._id,
            cells: [
                <div>
                    <span className="block whitespace-nowrap font-bold text-foreground">{menu.name}</span>
                    <span className="block max-w-50 truncate whitespace-nowrap text-xs text-muted-foreground">{menu.description || "Chưa có mô tả"}</span>
                </div>,
                <span className="tabular-nums">{menu.foodCount ?? foods.length}</span>,
                <div className="flex flex-wrap gap-1.5">
                    {foods.length === 0
                        ? <span className="text-xs text-muted-foreground">Chưa có món</span>
                        : foods.map((food: any) => (
                            <span key={food._id} className="rounded-md border bg-muted px-2 py-1 text-xs">
                                {food.name}
                            </span>
                        ))}
                </div>,
                <Badge tone={status?.tone ?? "neutral"}>{status?.label ?? menu.status}</Badge>,
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
            ]
        }
    })

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Thực đơn"
                description="Quản lý và cập nhật các thực đơn của quán"
                action={createButton}
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status ? [{ key: "status", label: `Trạng thái: ${menuStatusConfig[query.status]?.label ?? query.status}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
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
                </div>

                <DataTable
                    headers={[
                        { label: "Tên thực đơn", className: "w-40", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Số món", className: "w-24 text-center" },
                        { label: "Món nổi bật", className: "w-80" },
                        { label: "Trạng thái", className: "w-32 text-center", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage={query.search || query.status ? "Không tìm thấy thực đơn phù hợp" : "Chưa có thực đơn nào"}
                    emptyDescription={query.search || query.status ? "Thử xoá bộ lọc hoặc đổi từ khóa để xem thêm thực đơn." : "Tạo thực đơn đầu tiên để thêm món ăn vào quán."}
                    emptyIcon={Utensils}
                    emptyAction={createButton}
                />

                {(pagination && menus.length > 0) && (
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
