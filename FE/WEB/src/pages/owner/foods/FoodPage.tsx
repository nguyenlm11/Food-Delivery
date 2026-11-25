import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useApiList from "@/hooks/useApiList "
import { deleteFood, getFoods, restoreFood, updateFoodStatus } from "@/services/food.service"
import { getMenus } from "@/services/menu.service"
import type { ActionTarget, AdminAction } from "@/types/api"
import type { FoodFilterValues } from "@/types/food.type"
import { foodActionConfig } from "@/utils/actionConfig"
import { foodStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Trash, UtensilsCrossed } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CreateFoodModal from "./CreateFoodModal"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

function FoodPage() {
    const { restaurantId } = useParams()
    const [menus, setMenus] = useState<any[]>([])

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const { items: foods, pagination, isLoading, query, setQuery, searchInput, setSearchInput, handleSort, handleSearch, handlePageChange, handlePageSizeChange } =
        useApiList({
            fetcher: getFoods,
            getItems: (response: any) => response.data.foods,
            socketEvents: ["food:created", "food:updated", "food:deleted", "connect"],
            initialQuery: { limit: 12, page: 1, restaurantId },
            onError: (error) => {
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
        })

    useEffect(() => {
        if (!restaurantId) { return }

        const loadMenus = async () => {
            try {
                const response = await getMenus({ restaurantId, limit: 100 })
                setMenus(response?.data?.menus ?? [])
            }
            catch {
                setMenus([])
            }
        }
        loadMenus()
    }, [restaurantId])

    const status = query.status ?? "all"
    const menuId = query.menuId ?? "all"

    const menuGroups = menus
        .filter(menu => menu.status !== "DELETED" || status === "DELETED")
        .map(menu => ({
            menu: menu,
            foods: foods.filter((food: any) => food.menuId && (food.menuId._id ?? food.menuId) === menu._id)
        }))

    const handleApplyFilter = (values: FoodFilterValues) => {
        setQuery((current: any) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            menuId: values.menuId === "all" ? undefined : values.menuId,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
        }
        setQuery((current: any) => ({
            ...current,
            [key]: undefined,
            page: 1
        }))
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
                    await updateFoodStatus(actionTarget.id, "INACTIVE")
                    break
                case "restore":
                    await updateFoodStatus(actionTarget.id, "ACTIVE")
                    break
                case "restoreDeleted":
                    await restoreFood(actionTarget.id)
                    break
                case "delete":
                    await deleteFood(actionTarget.id)
                    break
            }
            setResult({
                isOpen: true,
                isSuccess: true,
                message: foodActionConfig[actionTarget.action].message
            })
        }
        catch (error) {
            setResult({
                isOpen: true,
                isSuccess: false,
                message: getLocalizedErrorMessage(getErrorData(error))
            })
        }
        finally {
            setConfirm((current) => ({ ...current, isProcessing: false, isOpen: false }))
        }
    }

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Thêm món ăn
        </Button>
    )

    const rows = menuGroups.flatMap(group => group.foods.map((food: any) => {
        const statusItem = foodStatusConfig[food.status]
        return {
            id: food._id,
            cells: [
                <div className="flex items-center gap-3">
                    {food.image
                        ? <img src={food.image} alt={food.name} className="size-10 shrink-0 rounded-lg object-cover" />
                        : <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background-surface-tinted text-muted-foreground">
                            <UtensilsCrossed className="size-4" />
                        </div>}
                    <div className="min-w-0">
                        <span className="block whitespace-nowrap font-medium text-foreground">{food.name}</span>
                        <span className="block max-w-72 truncate whitespace-nowrap text-xs text-muted-foreground">{food.description || "Chưa có mô tả"}</span>
                    </div>
                </div>,
                <span className="block whitespace-nowrap text-muted-foreground">{group.menu.name}</span>,
                <span className="block whitespace-nowrap text-right font-medium tabular-nums text-foreground">{food.originalPrice.toLocaleString("vi-VN")}đ</span>,
                <span className="block whitespace-nowrap text-right tabular-nums text-muted-foreground">{food.platformPrice.toLocaleString("vi-VN")}đ</span>,
                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>,
                <RowActions
                    actions={[
                        food.status === "ACTIVE" && {
                            label: "Tạm ngừng",
                            icon: <EyeOff className="size-4" />,
                            onClick: () => openAction(food._id, food.name, "hide", "Tạm ngừng")
                        },
                        food.status === "INACTIVE" && {
                            label: "Khôi phục",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(food._id, food.name, "restore", "Khôi phục")
                        },
                        food.status === "DELETED" && {
                            label: "Khôi phục từ thùng rác",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(food._id, food.name, "restoreDeleted", "Khôi phục")
                        },
                        food.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(food._id, food.name, "delete", "Xóa")
                        }
                    ]}
                />
            ]
        }
    }))

    const hasFilter = Boolean(query.search) || status !== "all" || menuId !== "all"

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Món ăn"
                description="Ảnh và giá bán là thứ khách nhìn thấy đầu tiên trên thẻ quán."
                action={createButton}
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(status !== "all" ? [{ key: "status", label: `Trạng thái: ${foodStatusConfig[status]?.label ?? status}` }] : []),
                            ...(menuId !== "all" ? [{ key: "menuId", label: `Thực đơn: ${menus.find(menu => menu._id === menuId)?.name ?? menuId}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên món ăn..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <Filter
                            values={{ status, menuId }}
                            groups={[
                                {
                                    key: "menuId",
                                    label: "Thực đơn",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        ...menus
                                            .filter(menu => menu.status !== "DELETED" || status === "DELETED")
                                            .map(menu => ({ label: menu.name, value: menu._id }))
                                    ]
                                },
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Đang bán", value: "ACTIVE" },
                                        { label: "Tạm ngừng", value: "INACTIVE" },
                                        { label: "Đã xóa", value: "DELETED" }
                                    ]
                                }
                            ]}
                            onApply={(values: FoodFilterValues) => {
                                handleApplyFilter(values)
                            }}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên món", className: "w-72", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Thực đơn", className: "w-40", sortKey: "menu", sortOrder: query.sortBy === "menu" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Giá bán", className: "w-28 text-right", sortKey: "originalPrice", sortOrder: query.sortBy === "originalPrice" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Giá sàn", className: "w-28 text-right", sortKey: "platformPrice", sortOrder: query.sortBy === "platformPrice" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Trạng thái", className: "w-32 text-center", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage={hasFilter ? "Không tìm thấy món ăn phù hợp" : "Chưa có món ăn nào"}
                    emptyDescription={hasFilter ? "Thử xoá bộ lọc hoặc đổi từ khóa để xem thêm món ăn." : "Thêm món ăn đầu tiên để khách hàng có thể đặt món."}
                    emptyIcon={UtensilsCrossed}
                    emptyAction={createButton}
                />

                {(pagination && rows.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name || "món ăn"}?`}
                description={foodActionConfig[actionTarget.action].description}
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

            <CreateFoodModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                restaurantId={restaurantId}
            />
        </div>
    )
}

export default FoodPage
