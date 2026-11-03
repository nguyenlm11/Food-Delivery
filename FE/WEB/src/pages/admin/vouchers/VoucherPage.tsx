import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
// import LoadingOverlay from "@/components/LoadingOverlay"
import { Button } from "@/components/ui/button"
import { getAllVouchers } from "@/services/voucher.service"
import type { GetAllVoucherParams } from "@/types/voucher.type"
import { EyeOff, Plus, RotateCcw, Ticket } from "lucide-react"
import { useEffect, useState } from "react"

function VoucherPage() {
    const [voucherResponse, setVoucherResponse] = useState<any>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<GetAllVoucherParams>({ search: "", status: undefined, typeVoucher: undefined, type: undefined, typeDiscount: undefined, date: undefined })
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    useEffect(() => {
        const loadVouchers = async () => {
            try {
                const response = await getAllVouchers({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    status: params.status,
                    type: params.type,
                    typeVoucher: params.typeVoucher,
                    typeDiscount: params.typeDiscount,
                    date: params.date,
                    sortBy,
                    sortOrder
                })
                setVoucherResponse(response)
            }
            catch (error) {
                setVoucherResponse(null)
            }
            finally {

            }
        }
        void loadVouchers()
    }, [currentPage, pageSize, params, sortBy, sortOrder])

    const vouchers = voucherResponse?.data.vouchers ?? []
    const pagination = voucherResponse?.data.pagination

    const rows = vouchers.map((voucher: any) => ({
        id: voucher._id,
        cells: [
            <span className="font-mono font-medium text-foreground">{voucher.code}</span>,
            <Badge tone={voucher.typeVoucher === "SYSTEM" ? "brand" : "info"}>
                {voucher.typeVoucher === "SYSTEM" ? "Hệ thống" : "Quán ăn"}
            </Badge>,
            <Badge tone="neutral">
                {voucher.type === "FOOD" ? "Món ăn" : "Phí giao hàng"}
            </Badge>,
            <span className="font-medium text-foreground">
                {voucher.typeDiscount === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString("vi-VN")}đ`}
            </span>,
            <span className="text-muted-foreground">
                {voucher.usedQuantity}
                {voucher.maxQuantity !== null ? ` / ${voucher.maxQuantity}` : ""}
            </span>,
            <Badge tone={voucher.status === "ACTIVE" ? "success" : "warning"}>
                {voucher.status === "ACTIVE" ? "Khả dụng" : "Tạm ẩn"}
            </Badge>,
            <RowActions
                label={voucher.name}
                actions={[{
                    label: voucher.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục",
                    icon: voucher.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                    onClick: () => { }
                }]}
            />
        ]
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Mã giảm giá</h2>
                    <p className="text-sm text-text-secondary">
                        Mã giảm giá của hệ thống và quán ăn
                    </p>
                </div>

                <Button>
                    <Plus className="size-4" />
                    Thêm mã khuyến mãi
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                    <Search
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder="Tìm theo mã..."
                        onSearch={() => {
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
                    values={{ null: "" }}
                    groups={[]}
                    onApply={() => { }}
                />
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <DataTable
                    headers={[
                        { label: "Mã", className: "w-[12%]" },
                        { label: "Loại", className: "w-[16%]" },
                        { label: "Áp dụng", className: "w-[16%]" },
                        { label: "Chiết khấu", className: "w-[18%]" },
                        { label: "Lượt dùng", className: "w-[14%]" },
                        { label: "Trạng thái", className: "w-[14%]" },
                        { label: "", className: "w-[10%]" }
                    ]}
                    rows={rows}
                    emptyMessage={"Không có mã khuyến mãi nào"}
                    emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo mã khuyễn mãi mới"}
                    emptyIcon={Ticket}
                />

                {(pagination && vouchers.length > 0) && (
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

export default VoucherPage