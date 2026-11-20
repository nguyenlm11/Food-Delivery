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
import type { ModifierFilterValues, ModifierGroup } from "@/types/modifier.type"
import { modifierActionConfig } from "@/utils/actionConfig"
import { modifierStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Settings, Trash } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CreateModifierGroupModal from "./CreateModifierGroupModal"
import { mockModifierGroups } from "../restaurants/mockData"

function ModifierGroupPage() {
    const [groups, setGroups] = useState<ModifierGroup[]>(mockModifierGroups)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<"all" | ModifierGroup["status"]>("all")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const filteredGroups = groups.filter((group) => {
        const keyword = search.trim().toLowerCase()

        if (keyword && !group.name.toLowerCase().includes(keyword)) {
            return false
        }

        if (status !== "all" && group.status !== status) {
            return false
        }

        return true
    })

    const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize))
    const currentPage = Math.min(page, totalPages)
    const visibleGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))

        try {
            if (actionTarget.action === "hide") {
                setGroups((current) => current.map(group => group._id === actionTarget.id ? { ...group, status: "INACTIVE" } : group))
            }
            else if (actionTarget.action === "restore" || actionTarget.action === "restoreDeleted") {
                setGroups((current) => current.map(group => group._id === actionTarget.id
                    ? {
                        ...group,
                        status: "ACTIVE",
                        options: group.options.map(option => option.status === "DELETED" ? { ...option, status: "ACTIVE" } : option)
                    }
                    : group
                ))
            }
            else {
                setGroups((current) => current.map(group => group._id === actionTarget.id
                    ? {
                        ...group,
                        status: "DELETED",
                        options: group.options.map(option => ({ ...option, status: "DELETED" }))
                    }
                    : group
                ))
            }

            setResult({
                isOpen: true,
                isSuccess: true,
                message: modifierActionConfig[actionTarget.action].message
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

    const rows = visibleGroups.map((group) => {
        const statusItem = modifierStatusConfig[group.status] ?? modifierStatusConfig.ACTIVE
        const activeOptions = group.options.filter(option => option.status !== "DELETED")

        return {
            id: group._id,
            cells: [
                <div className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{group.name}</span>
                    <span className="block text-xs text-muted-foreground">
                        Chọn từ {group.minSelect} đến {group.maxSelect} lựa chọn
                    </span>
                </div>,
                <span className="block whitespace-nowrap text-muted-foreground">
                    {activeOptions.length} lựa chọn
                </span>,
                <span className="block max-w-96 truncate text-muted-foreground">
                    {activeOptions.map(option => option.name).join(", ") || "Chưa có lựa chọn nào"}
                </span>,
                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>,
                <RowActions
                    actions={[
                        {
                            label: group.status === "ACTIVE" ? "Tạm ẩn" : group.status === "DELETED" ? "Khôi phục từ thùng rác" : "Khôi phục",
                            icon: group.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openAction(group._id, group.name, group.status === "ACTIVE" ? "hide" : group.status === "DELETED" ? "restoreDeleted" : "restore", group.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục")
                        },
                        group.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(group._id, group.name, "delete", "Xóa")
                        }
                    ]}
                />
            ]
        }
    })

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Thêm nhóm tùy chọn
        </Button>
    )

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Nhóm tùy chọn"
                description="Chọn được bao nhiêu tuỳ chọn khi gọi món, mỗi lựa chọn cộng thêm bao nhiêu."
                action={createButton}
            />

            <div className="flex shrink-0 flex-col gap-3 rounded-xl border bg-card p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                        <Search
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Tìm theo tên nhóm tùy chọn..."
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
                        onApply={(values: ModifierFilterValues) => {
                            setStatus(values.status)
                            setPage(1)
                        }}
                    />
                </div>

                {(search || status !== "all") && (
                    <ActiveFilters
                        filters={[
                            ...(search ? [{ key: "search", label: `Từ khóa: ${search}` }] : []),
                            ...(status !== "all" ? [{ key: "status", label: `Trạng thái: ${modifierStatusConfig[status]?.label ?? status}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />
                )}
            </div>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <DataTable
                    headers={[
                        { label: "Nhóm tùy chọn", className: "min-w-64" },
                        { label: "Số lựa chọn", className: "min-w-32" },
                        { label: "Lựa chọn", className: "min-w-72" },
                        { label: "Trạng thái", className: "min-w-32" },
                        { label: "Thao tác", className: "w-14" }
                    ]}
                    rows={rows}
                    emptyMessage="Chưa có nhóm tùy chọn nào"
                    emptyDescription="Tạo nhóm tùy chọn để khách hàng linh hoạt hơn khi gọi món."
                    emptyIcon={Settings}
                    emptyAction={createButton}
                />
            </section>

            {filteredGroups.length > 0 && (
                <div className="shrink-0 rounded-xl border bg-card">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredGroups.length}
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
                title={`${actionTarget.title} ${actionTarget.name || "nhóm tùy chọn"}?`}
                description={modifierActionConfig[actionTarget.action].description}
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

            <CreateModifierGroupModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreated={(group) => setGroups((current) => [...current, group])}
            />
        </div>
    )
}

export default ModifierGroupPage
