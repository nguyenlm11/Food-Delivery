import { useEffect, useState } from "react"
import ConfirmDialog from "@/components/ConfirmDialog"
import ResultDialog from "@/components/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteCategory, getAllCategories, restoreCategory, updateCategoryStatus } from "@/services/category.service"
import socket from "@/services/core/socket"
import type { CategoryFilterValues, GetAllCategoriesParams } from "@/types/category.type"
import type { ActionTarget } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { categoryStatusConfig } from "@/utils/statusConfig"
import { categoryActionConfig } from "@/utils/actionConfig"
import { Edit, Eye, EyeOff, Plus, RotateCcw, Tags, Trash } from "lucide-react"
import CreateCategoryModal from "./CreateCategoryModal"

function CategoryPage() {
    const [query, setQuery] = useState<GetAllCategoriesParams>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [categoryToAction, setCategoryToAction] = useState<ActionTarget>({ id: "", name: "", action: "hide" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const categories = data?.data.categories ?? []
    const pagination = data?.data.pagination
    const statusFilterValue = query.status === undefined ? "all" : query.status

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllCategories(query)
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
    }, [query, reloadKey])

    useEffect(() => {
        const handleCategoryChange = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("category:created", handleCategoryChange)
        socket.on("category:deleted", handleCategoryChange)
        socket.on("category:restored", handleCategoryChange)
        socket.on("category:updated", handleCategoryChange)

        return () => {
            socket.off("category:created", handleCategoryChange)
            socket.off("category:deleted", handleCategoryChange)
            socket.off("category:restored", handleCategoryChange)
            socket.off("category:updated", handleCategoryChange)
        }
    }, [])

    const handleSort = (key: string) => {
        setQuery((current) => ({
            ...current,
            sortBy: key,
            sortOrder: current.sortBy === key ? (current.sortOrder === "asc" ? "desc" : "asc") : "asc",
            page: 1
        }))
    }

    const handleSearch = () => {
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
    }

    const handleApplyFilter = (values: CategoryFilterValues) => {
        setQuery((current) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setQuery((current) => ({ ...current, search: "", page: 1 }))
            return
        }
        if (key === "status") {
            setQuery((current) => ({ ...current, status: undefined, page: 1 }))
        }
    }

    const openCategoryAction = (id: string, name: string, status: string) => {
        const action = status === "ACTIVE" ? "hide" : status === "DELETED" ? "restoreDeleted" : "restore"
        setCategoryToAction({ id, name, action })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const openCategoryDelete = (id: string, name: string) => {
        setCategoryToAction({ id, name, action: "delete" })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            if (categoryToAction.action === "hide") {
                await updateCategoryStatus(categoryToAction.id, "INACTIVE")
            }
            else if (categoryToAction.action === "restore") {
                await updateCategoryStatus(categoryToAction.id, "ACTIVE")
            }
            else if (categoryToAction.action === "restoreDeleted") {
                await restoreCategory(categoryToAction.id)
            }
            else {
                await deleteCategory(categoryToAction.id)
            }
            setReloadKey((current) => current + 1)
            setResult({
                isOpen: true,
                isSuccess: true,
                message: categoryActionConfig[categoryToAction.action].message
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

    const rows = categories.map((category: any) => {
        const statusItem = categoryStatusConfig[category.status] ?? categoryStatusConfig.ACTIVE

        return {
            id: category._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {category.iconImage && <AvatarImage src={category.iconImage} alt={category.name} />}
                        <AvatarFallback name={category.name}>{(category.name ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block whitespace-nowrap font-medium text-foreground">{category.name}</span>
                </div>,
                <span className="block whitespace-nowrap text-muted-foreground">{category.slug}</span>,
                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>,
                <RowActions
                    label={category.name ?? "danh mục"}
                    actions={[
                        {
                            label: "Xem chi tiết",
                            icon: <Eye className="size-4" />,
                            onClick: () => { }
                        },
                        {
                            label: "Chỉnh sửa",
                            icon: <Edit className="size-4" />,
                            onClick: () => { }
                        },
                        {
                            label: category.status === "ACTIVE" ? categoryActionConfig.hide.label : category.status === "DELETED" ? categoryActionConfig.restoreDeleted.label : categoryActionConfig.restore.label,
                            icon: category.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openCategoryAction(category._id, category.name, category.status)
                        },
                        ...(category.status !== "DELETED" ? [{
                            label: categoryActionConfig.delete.label,
                            icon: <Trash className="size-4" />,
                            onClick: () => openCategoryDelete(category._id, category.name)
                        }] : [])
                    ]}
                />
            ]
        }
    })

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Danh mục</h2>
                    <p className="text-sm text-text-secondary">
                        Danh mục dành cho các quán ăn.
                    </p>
                </div>

                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="size-4" />
                    Thêm danh mục
                </Button>
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${categoryStatusConfig[query.status]?.label ?? query.status}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên hoặc slug..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <Filter
                            values={{ status: statusFilterValue }}
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
                        { label: "Danh mục", className: "min-w-56", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Slug", className: "min-w-48", sortKey: "slug", sortOrder: query.sortBy === "slug" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Trạng thái", className: "min-w-32", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={10}
                    emptyMessage="Không có danh mục nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo danh mục mới."
                    emptyIcon={Tags}
                />

                {(!isLoading && pagination && categories.length > 0) && (
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

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${categoryActionConfig[categoryToAction.action].title} ${categoryToAction.name || "danh mục"}?`}
                description={categoryActionConfig[categoryToAction.action].description}
                confirmLabel={categoryActionConfig[categoryToAction.action].confirmLabel}
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />

            <CreateCategoryModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </div>
    )
}

export default CategoryPage
