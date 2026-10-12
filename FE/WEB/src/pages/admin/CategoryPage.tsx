import { useEffect, useState } from "react"
import { getAllCategories } from "../../services/category.service"
import DataTable from "../../components/data-table/DataTable"
import Pagination from "../../components/data-table/Pagination"
import Search from "../../components/data-table/Search"
import Filter from "../../components/data-table/Filter"
import RowActions from "../../components/data-table/RowActions"
import { EyeOff, Pencil, Plus, RotateCcw, X } from "lucide-react"
import { Button } from "../../components/ui/button"

interface CategoryParams {
    search: string
    isActive?: boolean
}

function CategoryPage() {
    const [categoriesResponse, setCategoriesResponse] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<CategoryParams>({
        search: "",
        isActive: undefined,
    })

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoading(true)
            setError("")
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
                setError("Không thể tải danh mục.")
            }
            finally {
                setIsLoading(false)
            }
        }

        void loadCategories()
    }, [currentPage, pageSize, params])

    const categories = categoriesResponse?.data.categories ?? []
    const pagination = categoriesResponse?.data.pagination

    const rows = categories.map((category: any) => ({
        id: category._id,
        cells: [
            category.name,
            category.slug,
            category.isActive ? "Khả dụng" : "Tạm ẩn",
            <RowActions
                label={category.name}
                actions={[
                    { label: "Chỉnh sửa", icon: <Pencil className="size-4" /> },
                    {
                        label: category.isActive ? "Ẩn danh mục" : "Khôi phục danh mục",
                        icon: category.isActive ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />
                    }
                ]}
            />
        ]
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Danh mục</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Danh sách danh mục
                </p>
            </div>

            <div className="flex w-full items-center gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="min-w-2xs">
                        <Search
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Tìm theo tên hoặc slug..."
                            onSearch={() => {
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    search: searchInput.trim(),
                                }))
                            }}
                        />
                    </div>

                    <Filter
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
                            setCurrentPage(1)
                            setParams((currentParams) => ({
                                ...currentParams,
                                isActive: values.isActive === "all" ? undefined : values.isActive === "active"
                            }))
                        }}
                    />
                </div>

                <Button className="ml-auto shrink-0">
                    <Plus className="size-4" />
                    Thêm danh mục
                </Button>
            </div>

            {(params.search || params.isActive !== undefined) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Đang áp dụng:</span>

                    {params.search && (
                        <div className="inline-flex h-8 items-center gap-1 rounded-md border bg-muted/40 pl-3 pr-1 text-sm">
                            <span>Từ khóa: {params.search}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Xóa từ khóa tìm kiếm"
                                onClick={() => {
                                    setCurrentPage(1)
                                    setSearchInput("")
                                    setParams((currentParams) => ({
                                        ...currentParams,
                                        search: "",
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
                                    setCurrentPage(1)
                                    setParams((currentParams) => ({
                                        search: currentParams.search,
                                    }))
                                }}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <section className="overflow-hidden rounded-xl border bg-card">
                {error ? (
                    <p className="p-5 text-sm text-destructive">
                        Lỗi khi tải danh mục: {error}
                    </p>
                ) : (
                    <>
                        <DataTable
                            headers={["Tên danh mục", "Slug", "Trạng thái", "Hành động"]}
                            rows={rows}
                            isLoading={isLoading}
                            emptyMessage="Chưa có danh mục nào."
                        />

                        {!isLoading && pagination && categories.length > 0 && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.total}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(newPageSize) => {
                                    setPageSize(newPageSize)
                                    setCurrentPage(1)
                                }}
                            />
                        )}
                    </>
                )}
            </section>
        </div>
    )
}

export default CategoryPage
