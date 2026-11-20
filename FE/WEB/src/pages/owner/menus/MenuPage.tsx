import { useState } from "react"
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
import type { ActionTarget, AdminAction } from "@/types/api"
import type { Menu, MenuFilterValues } from "@/types/menu.type"
import { menuActionConfig } from "@/utils/actionConfig"
import { menuStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Trash, Utensils } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CreateMenuModal from "./CreateMenuModal"
import { FOOD_IMAGES, mockFoods, mockMenus } from "../restaurants/mockData"

const MENU_COVERS: Record<string, string> = {
    "menu-01": FOOD_IMAGES.pho,
    "menu-02": FOOD_IMAGES.banhMi,
    "menu-03": FOOD_IMAGES.traDa,
    "menu-04": FOOD_IMAGES.cha
}

function MenuPage() {
    const [menus, setMenus] = useState<Menu[]>(mockMenus)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<"all" | Menu["status"]>("all")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const filteredMenus = menus.filter((menu) => {
        const keyword = search.trim().toLowerCase()

        if (keyword && !menu.name.toLowerCase().includes(keyword)) {
            return false
        }

        if (status !== "all" && menu.status !== status) {
            return false
        }

        return true
    })

    const totalPages = Math.max(1, Math.ceil(filteredMenus.length / pageSize))
    const currentPage = Math.min(page, totalPages)
    const visibleMenus = filteredMenus.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))

        try {
            if (actionTarget.action === "hide") {
                setMenus((current) => current.map(menu => menu._id === actionTarget.id ? { ...menu, status: "INACTIVE" } : menu))
            }
            else if (actionTarget.action === "restore" || actionTarget.action === "restoreDeleted") {
                setMenus((current) => current.map(menu => menu._id === actionTarget.id ? { ...menu, status: "ACTIVE" } : menu))
            }
            else {
                setMenus((current) => current.map(menu => menu._id === actionTarget.id ? { ...menu, status: "DELETED" } : menu))
            }

            setResult({
                isOpen: true,
                isSuccess: true,
                message: menuActionConfig[actionTarget.action].message
            })
        }
        finally {
            setConfirm((current) => ({ ...current, isProcessing: false, isOpen: false }))
        }
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setSearch("")
        }
        if (key === "status") {
            setStatus("all")
        }

        setPage(1)
    }

    const rows = visibleMenus.map((menu) => {
        const statusItem = menuStatusConfig[menu.status] ?? menuStatusConfig.ACTIVE
        const cover = MENU_COVERS[menu._id] ?? FOOD_IMAGES.cha
        const menuFoods = mockFoods.filter(food => food.menuId === menu._id && food.status !== "DELETED")

        return {
            id: menu._id,
            cells: [
                <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-background-surface-tinted">
                        <img
                            src={cover}
                            alt={`Ảnh đại diện thực đơn ${menu.name}`}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover"
                        />
                    </div>

                    <div className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{menu.name}</span>
                        <span className="block max-w-72 truncate text-xs text-muted-foreground">
                            {menu.description || "Chưa có mô tả cho thực đơn này."}
                        </span>
                    </div>
                </div>,
                <span className="block whitespace-nowrap text-muted-foreground">
                    {menuFoods.length} món
                </span>,
                <span className="block max-w-80 truncate text-muted-foreground">
                    {menuFoods.slice(0, 3).map(food => food.name).join(", ") || "Chưa có món ăn nào"}
                </span>,
                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>,
                <RowActions
                    actions={[
                        {
                            label: menu.status === "ACTIVE" ? "Tạm ẩn" : menu.status === "DELETED" ? "Khôi phục từ thùng rác" : "Khôi phục",
                            icon: menu.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openAction(menu._id, menu.name, menu.status === "ACTIVE" ? "hide" : menu.status === "DELETED" ? "restoreDeleted" : "restore", menu.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục")
                        },
                        menu.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(menu._id, menu.name, "delete", "Xóa")
                        }
                    ]}
                />
            ]
        }
    })

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Thêm thực đơn
        </Button>
    )

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Thực đơn"
                description="Mỗi thực đơn là một nhóm món khách hàng thấy trên thẻ quán của bạn."
                action={createButton}
            />

            <div className="flex shrink-0 flex-col gap-3 rounded-xl border bg-card p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                        <Search
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Tìm theo tên thực đơn..."
                            onSearch={() => {
                                setSearch(searchInput.trim())
                                setPage(1)
                            }}
                        />
                    </div>

                    <Filter
                        values={{ status }}
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
                        onApply={(values: MenuFilterValues) => {
                            setStatus(values.status)
                            setPage(1)
                        }}
                    />
                </div>

                {(search || status !== "all") && (
                    <ActiveFilters
                        filters={[
                            ...(search ? [{ key: "search", label: `Từ khóa: ${search}` }] : []),
                            ...(status !== "all" ? [{ key: "status", label: `Trạng thái: ${menuStatusConfig[status]?.label ?? status}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />
                )}
            </div>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <DataTable
                    headers={[
                        { label: "Thực đơn", className: "min-w-72" },
                        { label: "Số món", className: "min-w-28" },
                        { label: "Món nổi bật", className: "min-w-56" },
                        { label: "Trạng thái", className: "min-w-32" },
                        { label: "Thao tác", className: "w-14" }
                    ]}
                    rows={rows}
                    emptyMessage="Chưa có thực đơn nào"
                    emptyDescription="Tạo thực đơn đầu tiên để bắt đầu thêm món ăn."
                    emptyIcon={Utensils}
                    emptyAction={createButton}
                />
            </section>

            {filteredMenus.length > 0 && (
                <div className="shrink-0 rounded-xl border bg-card">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredMenus.length}
                        pageSize={pageSize}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setPage(1)
                        }}
                    />
                </div>
            )}

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name || "thực đơn"}?`}
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
                onCreated={(menu) => setMenus((current) => [...current, menu])}
            />
        </div>
    )
}

export default MenuPage
