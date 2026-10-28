import { useEffect, useState } from "react"
import { deleteCategory, getAllCategories, restoreCategory } from "../../../services/category.service"
import socket from "../../../services/socket"
import DataTable from "../../../components/data-table/DataTable"
import Pagination from "../../../components/data-table/Pagination"
import Search from "../../../components/data-table/Search"
import Filter from "../../../components/data-table/Filter"
import RowActions from "../../../components/data-table/RowActions"
import { EyeOff, Plus, RotateCcw, X } from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import ConfirmDialog from "../../../components/ConfirmDialog"
import LoadingOverlay from "../../../components/LoadingOverlay"
import ResultDialog from "../../../components/ResultDialog"
import { AxiosError } from "axios"
import type { BackendErrorResponse } from "../../../types/api"
import { getLocalizedErrorMessage } from "../../../utils/errorDictionary"
import CreateCategoryModal from "./CreateCategoryModal"

interface CategoryParams {
    search: string
    isActive?: boolean
}

function CategoryPage() {
    const [categoriesResponse, setCategoriesResponse] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [categoryToAction, setCategoryToAction] = useState<{ id: string, name: string }>()
    const [categoryAction, setCategoryAction] = useState("restore")
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [reloadKey, setReloadKey] = useState(0)
    const [params, setParams] = useState<CategoryParams>({ search: "", isActive: undefined })

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getAllCategories({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    isActive: params.isActive
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
    }, [currentPage, pageSize, params, reloadKey])

    useEffect(() => {
        const handleCategoryChange = () => { setReloadKey((currentKey) => currentKey + 1) }

        socket.connect()
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

    const openCategoryAction = (id: string, name: string, isActive: boolean) => {
        setCategoryToAction({ id, name })
        setCategoryAction(isActive ? "hide" : "restore")
        setIsCategoryDialogOpen(true)
    }

    const categoryItems = categories.map((category: any) => ({
        id: category._id,
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        icon: <img src={category.iconImage} className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-border-default" />
    }))

    const rows = categoryItems.map((item: any) => ({
        id: item.id,
        cells: [
            item.icon,
            <span className="font-medium text-foreground">{item.name}</span>,
            <span className="text-muted-foreground">{item.slug}</span>,
            <Badge tone={item.isActive ? "success" : "error"}>{item.isActive ? "Khả dụng" : "Tạm ẩn"}</Badge>,
            <RowActions
                label={item.name}
                actions={[{
                    label: item.isActive ? "Tạm ẩn" : "Khôi phục",
                    icon: item.isActive ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                    onClick: () => openCategoryAction(item.id, item.name, item.isActive)
                }]}
            />
        ]
    }))

    const handleConfirmCategoryAction = async () => {
        if (!categoryToAction) return
        setIsCategoryDialogOpen(false)
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
            setIsResultDialogOpen(true)
        }
    }

    const overlayMessage = isLoading ? "Đang tải danh mục" : categoryAction === "hide"
        ? "Đang ẩn danh mục"
        : "Đang khôi phục danh mục"

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Danh mục</h2>
                    <p className="text-sm text-text-secondary">
                        Danh mục dành cho các quán ăn.
                    </p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full shrink-0 sm:w-auto"
                >
                    <Plus className="size-4" />
                    Thêm danh mục
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                    className="w-full sm:w-auto"
                    values={{ isActive: params.isActive === undefined ? "all" : params.isActive ? "active" : "inactive" }}
                    groups={[{
                        key: "isActive",
                        label: "Trạng thái",
                        options: [
                            { label: "Tất cả", value: "all" },
                            { label: "Khả dụng", value: "active" },
                            { label: "Tạm ẩn", value: "inactive" }
                        ]
                    }]}
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

            {(params.search || params.isActive !== undefined) && (
                <div className="flex flex-wrap items-center gap-2">
                    {params.search && (
                        <div className="inline-flex h-8 items-center gap-1 rounded-md border bg-muted/40 pl-3 pr-1 text-sm">
                            <span>Từ khóa: {params.search}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Xóa bộ lọc từ khóa"
                                onClick={() => {
                                    setIsLoading(true)
                                    setCurrentPage(1)
                                    setSearchInput("")
                                    setParams((currentParams) => ({
                                        ...currentParams,
                                        search: ""
                                    }))
                                }}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    )}

                    {params.isActive !== undefined && (
                        <div className="inline-flex h-8 items-center gap-1 rounded-md border bg-muted/40 pl-3 pr-1 text-sm">
                            <span>Trạng thái: {params.isActive ? "Khả dụng" : "Tạm ẩn"}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Xóa bộ lọc trạng thái"
                                onClick={() => {
                                    setIsLoading(true)
                                    setCurrentPage(1)
                                    setParams((currentParams) => ({ search: currentParams.search }))
                                }}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <section className="overflow-hidden rounded-xl border bg-card">
                {!isLoading && (
                    <DataTable
                        headers={["Hình ảnh", "Tên danh mục", "Slug", "Trạng thái", ""]}
                        rows={rows}
                        emptyMessage={"Không có danh mục nào"}
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
                            setIsLoading(true)
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
                onConfirm={handleConfirmCategoryAction}
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
                onSuccess={() => { setReloadKey((key) => key + 1) }}
            />

            {(isLoading || isProcessing) && (
                <LoadingOverlay message={overlayMessage} />
            )}
        </div >
    )
}

export default CategoryPage
