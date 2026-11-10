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
import { deleteCategory, getAllCategories, restoreCategory } from "@/services/category.service"
import socket from "@/services/core/socket"
import type { CategoryFilterValues, GetAllCategoriesParams } from "@/types/category.type"
import type { ActionTarget } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { categoryStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Tags } from "lucide-react"
import CreateCategoryModal from "./CreateCategoryModal"

function CategoryPage() {
    const [query, setQuery] = useState<GetAllCategoriesParams>({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "",
        isActive: undefined
    })
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [categoryToAction, setCategoryToAction] = useState<ActionTarget>({ id: "", name: "", action: "hide" })

    const [dialog, setDialog] = useState({
        isConfirmOpen: false,
        isProcessing: false,
        isResultOpen: false,
        isSuccess: true,
        message: ""
    })

    const categories = data?.data.categories ?? []
    const pagination = data?.data.pagination
    const isActiveFilterValue = query.isActive === undefined ? "all" : query.isActive ? "active" : "inactive"

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

        return () => {
            socket.off("category:created", handleCategoryChange)
            socket.off("category:deleted", handleCategoryChange)
            socket.off("category:restored", handleCategoryChange)
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
            isActive: values.isActive === "all" ? undefined : values.isActive === "active",
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setQuery((current) => ({ ...current, search: "", page: 1 }))
            return
        }
        if (key === "isActive") {
            setQuery((current) => ({ ...current, isActive: undefined, page: 1 }))
        }
    }

    const openCategoryAction = (id: string, name: string, isActive: boolean) => {
        setCategoryToAction({ id, name, action: isActive ? "hide" : "restore" })
        setDialog((current) => ({ ...current, isConfirmOpen: true }))
    }

    const handleConfirmAction = async () => {
        setDialog((current) => ({ ...current, isProcessing: true }))
        try {
            if (categoryToAction.action === "hide") {
                await deleteCategory(categoryToAction.id)
            }
            else {
                await restoreCategory(categoryToAction.id)
            }
            setReloadKey((current) => current + 1)
            setDialog((current) => ({
                ...current,
                isSuccess: true,
                message: categoryToAction.action === "hide" ? "Danh mục đã được ẩn thành công." : "Danh mục đã được khôi phục thành công."
            }))
        }
        catch (error) {
            const response = getErrorData(error)
            setDialog((current) => ({
                ...current,
                isSuccess: false,
                message: getLocalizedErrorMessage(response)
            }))
        }
        finally {
            setDialog((current) => ({
                ...current,
                isProcessing: false,
                isConfirmOpen: false,
                isResultOpen: true
            }))
        }
    }

    const rows = categories.map((category: any) => {
        const status = category.isActive ? categoryStatusConfig.ACTIVE : categoryStatusConfig.INACTIVE

        return {
            id: category._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        {category.iconImage && <AvatarImage src={category.iconImage} alt={category.name} />}
                        <AvatarFallback name={category.name}>{(category.name ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block truncate font-medium text-foreground">{category.name}</span>
                </div>,
                <span className="block truncate text-muted-foreground">{category.slug}</span>,
                <Badge tone={status.tone}>{status.label}</Badge>,
                <RowActions
                    label={category.name ?? "danh mục"}
                    actions={[{
                        label: category.isActive ? "Tạm ẩn" : "Khôi phục",
                        icon: category.isActive ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                        onClick: () => openCategoryAction(category._id, category.name, category.isActive)
                    }]}
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
                            ...(query.isActive !== undefined ? [{ key: "isActive", label: `Trạng thái: ${query.isActive ? categoryStatusConfig.ACTIVE.label : categoryStatusConfig.INACTIVE.label}` }] : [])
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
                            values={{ isActive: isActiveFilterValue }}
                            groups={[
                                {
                                    key: "isActive",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Khả dụng", value: "active" },
                                        { label: "Tạm ẩn", value: "inactive" }
                                    ]
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Danh mục", className: "w-[38%]", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Slug", className: "w-[32%]", sortKey: "slug", sortOrder: query.sortBy === "slug" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Trạng thái", className: "w-[22%]", sortKey: "isActive", sortOrder: query.sortBy === "isActive" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-[8%]" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={query.limit}
                    emptyMessage="Không có danh mục nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo danh mục mới."
                    emptyIcon={Tags}
                />

                {(!isLoading && pagination && categories.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={query.limit}
                        onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                        onPageSizeChange={(size) => setQuery((current) => ({ ...current, limit: size, page: 1 }))}
                    />
                )}
            </section>

            <ConfirmDialog
                open={dialog.isConfirmOpen}
                onOpenChange={(open) => setDialog((current) => ({ ...current, isConfirmOpen: open }))}
                title={`${categoryToAction.action === "hide" ? "Tạm ẩn" : "Khôi phục"} ${categoryToAction.name || "danh mục"}?`}
                description={categoryToAction.action === "hide" ? "Danh mục sẽ không còn hiển thị cho khách hàng." : "Danh mục sẽ được hiển thị lại cho khách hàng."}
                confirmLabel={categoryToAction.action === "hide" ? "Ẩn danh mục" : "Khôi phục"}
                loading={dialog.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={dialog.isResultOpen}
                onOpenChange={(open) => setDialog((current) => ({ ...current, isResultOpen: open }))}
                isSuccess={dialog.isSuccess}
                message={dialog.message}
            />

            <CreateCategoryModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </div>
    )
}

export default CategoryPage
