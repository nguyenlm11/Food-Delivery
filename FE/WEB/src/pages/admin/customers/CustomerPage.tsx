import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import Search from "@/components/data-table/Search"
// import LoadingOverlay from "@/components/LoadingOverlay"
import { Button } from "@/components/ui/button"
import { PersonStanding, Plus } from "lucide-react"

function CustomerPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Khách hàng</h2>
                    <p className="text-sm text-text-secondary">
                        Khách hàng của hệ thống và quán ăn
                    </p>
                </div>

                <Button>
                    <Plus className="size-4" />
                    Thêm Khách hàng
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                    <Search
                        value={""}
                        onChange={() => { }}
                        placeholder="Tìm theo tên hoặc email..."
                        onSearch={() => { }}
                    />
                </div>

                <Filter className="w-full sm:w-auto"
                    values={{ null: "" }}
                    groups={[]}
                    onApply={() => { }}
                />
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <DataTable
                    headers={[
                        { label: "Tên khách hàng", className: "w-[20%]" },
                        { label: "Email", className: "w-[20%]" },
                        { label: "Số điện thoại", className: "w-[10%]" },
                        { label: "Địa chỉ", className: "w-[25%]" },
                        { label: "Ngày sinh", className: "w-[10%]" },
                        { label: "Trạng thái", className: "w-[10%]" },
                        { label: "", className: "w-[5%]" }
                    ]}
                    rows={[]}
                    emptyMessage={"Không có khách hàng nào"}
                    emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo khách hàng mới"}
                    emptyIcon={PersonStanding}
                />

                <Pagination
                    currentPage={1}
                    totalPages={50}
                    totalItems={10}
                    pageSize={10}
                    onPageChange={() => { }}
                    onPageSizeChange={() => { }}
                />
            </section>

            {/* <LoadingOverlay message="Đang tải mã khuyến mãi" scope="content" /> */}
        </div>
    )
}

export default CustomerPage

