import { useEffect, useState } from "react"
import { getAllCategories } from "../../services/category.service"
import type { Category } from "../../types/category.types"
import DataTable from "../../components/data-table/DataTable"
import RowActions from "../../components/data-table/RowActions"
import { EyeOff, Pencil, RotateCcw } from "lucide-react"

function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryList = await getAllCategories()
                setCategories(categoryList)
            }
            catch (error) {
                if (error instanceof Error) {
                    setError(error.message)
                }
                else {
                    setError("Không thể tải danh mục.")
                }
            }
            finally {
                setIsLoading(false)
            }
        }

        void loadCategories()
    }, [])

    // Chuyển Category thành các hàng mà DataTable có thể hiển thị.
    const rows = categories.map((category) => ({
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
            />,
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

            <section className="rounded-xl border bg-card">
                {error ? (
                    <p className="p-5 text-sm text-destructive">
                        Lỗi khi tải danh mục: {error}
                    </p>
                ) : (
                    <DataTable
                        headers={["Tên danh mục", "Slug", "Trạng thái", "Hành động"]}
                        rows={rows}
                        isLoading={isLoading}
                        emptyMessage="Chưa có danh mục nào."
                    />
                )}
            </section>
        </div>
    )
}

export default CategoryPage
