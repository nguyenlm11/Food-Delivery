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
import { deleteModifierGroup, getModifierGroups, restoreModifierGroup, updateModifierGroupStatus } from "@/services/modifier.service"
import socket from "@/services/core/socket"
import type { ActionTarget, AdminAction } from "@/types/api"
import type { GetModifierGroupsQuery, ModifierFilterValues } from "@/types/modifier.type"
import { modifierActionConfig } from "@/utils/actionConfig"
import { modifierStatusConfig } from "@/utils/statusConfig"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { EyeOff, Plus, RotateCcw, Settings, Trash } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CreateModifierGroupModal from "./CreateModifierGroupModal"

function ModifierGroupPage() {
    const { restaurantId } = useParams()
    const [query, setQuery] = useState<GetModifierGroupsQuery>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const modifiers = data?.data.groups ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        if (!restaurantId) { return }

        const loadData = async () => {
            try {
                const response = await getModifierGroups({ ...query, restaurantId })
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

        socket.on("modifier:created", handleReload)
        socket.on("modifier:updated", handleReload)
        socket.on("modifier:deleted", handleReload)
        socket.on("connect", handleReload)

        return () => {
            socket.off("modifier:created", handleReload)
            socket.off("modifier:updated", handleReload)
            socket.off("modifier:deleted", handleReload)
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

    const handleApplyFilter = (values: ModifierFilterValues) => {
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
            setQuery((current) => ({ ...current, search: "", page: 1 }))
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
                    await updateModifierGroupStatus(actionTarget.id, "INACTIVE")
                    break
                case "restore":
                    await updateModifierGroupStatus(actionTarget.id, "ACTIVE")
                    break
                case "restoreDeleted":
                    await restoreModifierGroup(actionTarget.id)
                    break
                case "delete":
                    await deleteModifierGroup(actionTarget.id)
                    break
            }
            setResult({
                isOpen: true,
                isSuccess: true,
                message: modifierActionConfig[actionTarget.action].message
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

    const rows = modifiers.map((modifier: any) => {
        return {
            id: modifier._id,
            cells: [
                <div>
                    <div className="font-bold">{modifier.name}</div>
                    <div className="text-xs text-muted-foreground">
                        Tối thiểu {modifier.minSelect}, tối đa {modifier.maxSelect} lựa chọn
                    </div>
                </div>,
                <div className="text-center font-extrabold">{modifier.options?.length ?? 0}</div>,
                <div className="flex flex-wrap gap-1.5">
                    {modifier.options?.map((option: any) => (
                        <span key={option._id} className="rounded-md border bg-muted px-2 py-1 text-xs">{option.name}</span>
                    ))}
                </div>,
                <Badge tone={modifierStatusConfig[modifier.status].tone}>{modifierStatusConfig[modifier.status].label}</Badge>,
                <RowActions
                    actions={[
                        modifier.status !== "DELETED" && {
                            label: modifier.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục",
                            icon: modifier.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openAction(modifier._id, modifier.name, modifier.status === "ACTIVE" ? "hide" : "restore", modifier.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục")
                        },
                        modifier.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(modifier._id, modifier.name, "delete", "Xóa")
                        },
                        modifier.status === "DELETED" && {
                            label: "Kích hoạt lại",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(modifier._id, modifier.name, "restoreDeleted", "Kích hoạt lại")
                        },
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

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status ? [{ key: "status", label: `Trạng thái: ${modifierStatusConfig[query.status]?.label ?? query.status}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên nhóm tùy chọn..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <Filter
                            values={{ status: query.status ?? "all", }}
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
                        { label: "Nhóm tùy chọn", className: "w-40", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Số lựa chọn", className: "w-32 text-center" },
                        { label: "Lựa chọn", className: "w-80" },
                        { label: "Trạng thái", className: "w-32 text-center", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-20 text-center" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage="Chưa có nhóm tùy chọn nào"
                    emptyDescription="Tạo nhóm tùy chọn để khách hàng linh hoạt hơn khi gọi món."
                    emptyIcon={Settings}
                    emptyAction={createButton}
                />

                {(pagination && modifiers.length > 0) && (
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
            />
        </div>
    )
}

export default ModifierGroupPage
