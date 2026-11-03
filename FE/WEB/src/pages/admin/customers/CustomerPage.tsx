import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import Search from "@/components/data-table/Search"
// import LoadingOverlay from "@/components/LoadingOverlay"
import { Button } from "@/components/ui/button"
import { PersonStanding, Plus } from "lucide-react"
import type { GetAllCustomerParams } from "@/types/customer.types"
import { getAllCustomers } from "@/services/customer.service"

type StatusConfig = {
    label: string;
    tone: "success" | "warning" | "error" | "neutral" | "brand" | "info";
};

const statusConfig: Record<string, StatusConfig> = {
    ACTIVE: { label: "Hoạt động", tone: "success" },
    INACTIVE: { label: "Không hoạt động", tone: "neutral" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    BLOCKED: { label: "Bị chặn", tone: "error" },
    DELETED: { label: "Bị xóa", tone: "error" },
};

function CustomerPage() {
    const [customersResponse, setCustomersResponse] = useState<any>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<GetAllCustomerParams>({ search: "", status: undefined })
    const [sortBy, setSortBy] = useState<string>("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const response = await getAllCustomers({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    status: params.status,
                    sortBy,
                    sortOrder
                })
                setCustomersResponse(response)
            }
            catch (error) {
                setCustomersResponse(null)
            }
            finally { }
        }
        void loadCustomers()
    }, [currentPage, pageSize, params, sortBy, sortOrder])

    const customers = customersResponse?.data.customers ?? []
    const pagination = customersResponse?.data.pagination

    const rows = customers.map((item: any) => ({
        id: item.id,
        cells: [
            <span className="block truncate font-medium text-foreground">{item.fullname}</span>,
            <span className="block truncate font-medium text-foreground">{item.email}</span>,
            <span className="block truncate font-medium text-foreground">{item.phone}</span>,
            <span className="block truncate font-medium text-foreground">{item.address}</span>,
            <span className="block truncate font-medium text-foreground">{new Date(item.birthday).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>,
            <Badge tone={statusConfig[item.status].tone}>{statusConfig[item.status].label}</Badge>
        ]
    }))

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
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder="Tìm theo tên hoặc email..."
                        onSearch={() => {
                            setCurrentPage(1)
                            setParams((currentParams) => ({
                                ...currentParams,
                                search: searchInput.trim()
                            }))
                        }}
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
                    rows={rows}
                    emptyMessage={"Không có khách hàng nào"}
                    emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo khách hàng mới"}
                    emptyIcon={PersonStanding}
                />

                {(pagination && customers.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pageSize}
                        onPageChange={(page) => {
                            setCurrentPage(page)
                        }}
                        onPageSizeChange={(newPageSize) => {
                            setPageSize(newPageSize)
                            setCurrentPage(1)
                        }}
                    />
                )}
            </section>

            {/* <LoadingOverlay message="Đang tải mã khuyến mãi" scope="content" /> */}
        </div>
    )
}

export default CustomerPage

