import { useEffect, useState } from "react"
import ConfirmDialog from "@/components/ConfirmDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import LoadingOverlay from "@/components/LoadingOverlay"
import ResultDialog from "@/components/ResultDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteCategory, getAllCategories, restoreCategory } from "@/services/category.service"
import socket from "@/services/socket"
import type { BackendErrorResponse } from "@/types/api"
import type { GetAllCategoriesParams } from "@/types/category.type"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"
import type { AxiosError } from "axios"
import { EyeOff, Plus, RotateCcw, Tags } from "lucide-react"
import CreateCategoryModal from "./CreateCategoryModal"

function CategoryPage() {
    const [categoriesResponse, setCategoriesResponse] = useState<any>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [categoryToAction, setCategoryToAction] = useState<{ id: string, name: string }>()
    const [categoryAction, setCategoryAction] = useState<"hide" | "active">("active")
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<GetAllCategoriesParams>({ search: "", isActive: undefined })
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getAllCategories({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    isActive: params.isActive,
                    sortBy,
                    sortOrder
                })
                setCategoriesResponse(response)
            }
            catch (error) {
                setCategoriesResponse(null)
                setIsResultSuccess(false)
                const response = (error as AxiosError<BackendErrorResponse>).response?.data
                setResultMessage(getLocalizedErrorMessage(response))
                setIsResultDialogOpen(true)
            }
            finally {
                setIsLoading(false)
            }
        }
        void loadCategories()
    }, [currentPage, pageSize, params, sortBy, sortOrder, reloadKey])

    useEffect(() => {
        const handleCategoryChange = () => { setReloadKey((currentKey) => currentKey + 1) }

        socket.on("category:created", handleCategoryChange)
        socket.on("category:deleted", handleCategoryChange)
        socket.on("category:restored", handleCategoryChange)

        return () => {
            socket.off("category:created", handleCategoryChange)
            socket.off("category:deleted", handleCategoryChange)
            socket.off("category:restored", handleCategoryChange)
        }
    }, [])

    const categories = categoriesResponse?.data.categories ?? []
    const pagination = categoriesResponse?.data.pagination

    const openCategoryAction = (id: string, name: string, action: "hide" | "active") => {
        setCategoryToAction({ id, name })
        setCategoryAction(action)
        setIsCategoryDialogOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!categoryToAction) return
        setIsProcessing(true)
        try {
            if (categoryAction === "hide") {
                await deleteCategory(categoryToAction.id)
                setResultMessage("Danh mục đã được ẩn thành công.")
            }
            else {
                await restoreCategory(categoryToAction.id)
                setResultMessage("Danh mục đã được khôi phục thành công.")
            }
            setIsResultSuccess(true)
        }
        catch (error) {
            setIsResultSuccess(false)
            const response = (error as AxiosError<BackendErrorResponse>).response?.data
            setResultMessage(getLocalizedErrorMessage(response))
        }
        finally {
            setIsProcessing(false)
            setIsCategoryDialogOpen(false)
            setIsResultDialogOpen(true)
        }
    }

    const handleSort = (newSortBy: string) => {
        setCurrentPage(1)
        if (newSortBy === sortBy) {
            setSortOrder((currentOrder) => currentOrder === "asc" ? "desc" : "asc")
        }
        else {
            setSortBy(newSortBy)
            setSortOrder("asc")
        }
    }

    const rows = categories.map((category: any) => ({
        id: category._id,
        cells: [
            <img src={category.iconImage} className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-border-default" />,
            <span className="block truncate font-medium text-foreground">{category.name}</span>,
            <span className="block truncate text-muted-foreground">{category.slug}</span>,
            <Badge tone={category.isActive ? "success" : "error"}>{category.isActive ? "Khả dụng" : "Tạm ẩn"}</Badge>,
            <RowActions
                label={category.name}
                actions={[{
                    label: category.isActive ? "Tạm ẩn" : "Khôi phục",
                    icon: category.isActive ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                    onClick: () => openCategoryAction(category._id, category.name, category.isActive ? "hide" : "active")
                }]}
            />
        ]
    }))

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Danh mục</h2>
                    <p className="text-sm text-text-secondary">
                        Danh mục dành cho các quán ăn.
                    </p>
                </div>

                <Button onClick={() => setIsCreateModalOpen(true)}                >
                    <Plus className="size-4" />
                    Thêm danh mục
                </Button>
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(params.search ? [{ key: "search", label: `Từ khóa: ${params.search}` }] : []),
                            ...(params.isActive !== undefined ? [{ key: "isActive", label: `Trạng thái: ${params.isActive ? "Khả dụng" : "Tạm ẩn"}` }] : [])
                        ]}
                        onRemove={(key) => {
                            setCurrentPage(1)
                            if (key === "search") setSearchInput("")
                            setParams((currentParams) => ({ ...currentParams, [key]: undefined }))
                        }}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[32%] lg:min-w-80">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên hoặc slug..."
                                onSearch={() => {
                                    setIsLoading(true)
                                    setCurrentPage(1)
                                    setParams((currentParams) => ({
                                        ...currentParams,
                                        search: searchInput.trim()
                                    }))
                                }}
                            />
                        </div>

                        <Filter
                            values={{ isActive: params.isActive === undefined ? "all" : params.isActive ? "active" : "inactive" }}
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
                            onApply={(values) => {
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    isActive: values.isActive === "all" ? undefined : values.isActive === "active"
                                }))
                            }}
                        />
                    </div>
                </div>

                {!isLoading && (
                    <DataTable
                        headers={[
                            { label: "Hình ảnh", className: "w-[15%]" },
                            { label: "Tên danh mục", className: "w-[25%]", sortKey: "name", sortOrder: sortBy === "name" ? sortOrder : null, onSort: handleSort },
                            { label: "Slug", className: "w-[30%]", sortKey: "slug", sortOrder: sortBy === "slug" ? sortOrder : null, onSort: handleSort },
                            { label: "Trạng thái", className: "w-[20%]", sortKey: "isActive", sortOrder: sortBy === "isActive" ? sortOrder : null, onSort: handleSort },
                            { label: "", className: "w-[10%]" }
                        ]}
                        rows={rows}
                        emptyMessage={"Không có danh mục nào"}
                        emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo danh mục mới."
                        emptyIcon={Tags}
                    />
                )}

                {(!isLoading && pagination && categories.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pageSize}
                        onPageChange={(page) => {
                            setIsLoading(true)
                            setCurrentPage(page)
                        }}
                        onPageSizeChange={(newPageSize) => {
                            setPageSize(newPageSize)
                            setCurrentPage(1)
                        }}
                    />
                )}
            </section>

            <ConfirmDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                title={`${categoryAction === "hide" ? "Tạm ẩn" : "Khôi phục"} ${categoryToAction?.name ?? ""}?`}
                description={categoryAction === "hide" ? "Danh mục sẽ không còn hiển thị cho khách hàng." : "Danh mục sẽ được hiển thị lại cho khách hàng."}
                confirmLabel={categoryAction === "hide" ? "Ẩn danh mục" : "Khôi phục"}
                loading={isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                isSuccess={isResultSuccess}
                message={resultMessage}
            />

            <CreateCategoryModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />

            {isLoading && (
                <LoadingOverlay message="Đang tải danh mục" scope="content" />
            )}
        </div>
    )
}

export default CategoryPage
