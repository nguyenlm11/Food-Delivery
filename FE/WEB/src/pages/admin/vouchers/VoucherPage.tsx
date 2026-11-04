import DataTable from "@/components/data-table/DataTable"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllVouchers } from "@/services/voucher.service"
import type { GetAllVoucherParams } from "@/types/voucher.type"
import { EyeOff, Plus, RotateCcw, Ticket } from "lucide-react"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import LoadingOverlay from "@/components/LoadingOverlay"
import DatePicker from "@/components/DatePicker"
import ResultDialog from "@/components/ResultDialog"
import type { AxiosError } from "axios"
import type { BackendErrorResponse } from "@/types/api"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"

function VoucherPage() {
    const [voucherResponse, setVoucherResponse] = useState<any>(null)

    const [isLoading, setIsLoading] = useState(true)
    // const [isProcessing, setIsProcessing] = useState(false)

    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
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
                setIsResultSuccess(false)
                const response = (error as AxiosError<BackendErrorResponse>).response?.data
                setResultMessage(getLocalizedErrorMessage(response))
                setIsResultDialogOpen(true)
            }
            finally {
                setIsLoading(false)
            }
        }
        void loadVouchers()
    }, [currentPage, pageSize, params, sortBy, sortOrder])

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
        <div className="space-y-3">
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

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(params.search ? [{ key: "search", label: `Từ khóa: ${params.search}` }] : []),
                            ...(params.status ? [{ key: "status", label: `Trạng thái: ${params.status === "ACTIVE" ? "Khả dụng" : "Đã ngừng"}` }] : []),
                            ...(params.typeVoucher ? [{ key: "typeVoucher", label: `Loại: ${params.typeVoucher === "SYSTEM" ? "Hệ thống" : "Quán ăn"}` }] : []),
                            ...(params.type ? [{ key: "type", label: `Áp dụng: ${params.type === "FOOD" ? "Món ăn" : "Phí giao hàng"}` }] : []),
                            ...(params.typeDiscount ? [{ key: "typeDiscount", label: `Chiết khấu: ${params.typeDiscount === "PERCENT" ? "Phần trăm" : "Giá cố định"}` }] : []),
                            ...(params.date ? [{ key: "date", label: `Ngày: ${params.date}` }] : [])
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
                                placeholder="Tìm theo mã..."
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

                        <DatePicker
                            id="voucher-filter-date"
                            value={specialDateFilter}
                            onChange={(date) => {
                                setSpecialDateFilter(date)
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    date: date ? format(date, "dd-MM-yyyy") : undefined
                                }))
                            }}
                            mode="full"
                            iconOnly
                        />

                        <Filter
                            values={{
                                typeVoucher: params.typeVoucher === "SYSTEM" ? "system" : params.typeVoucher === "RESTAURANT" ? "restaurant" : "all",
                                type: params.type === "SHIP" ? "ship" : params.type === "FOOD" ? "food" : "all",
                                typeDiscount: params.typeDiscount === "AMOUNT" ? "amount" : params.typeDiscount === "PERCENT" ? "percent" : "all",
                                status: params.status === "ACTIVE" ? "active" : params.status === "INACTIVE" ? "inactive" : "all"
                            }}
                            groups={[
                                {
                                    key: "typeVoucher",
                                    label: "Loại mã",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Hệ thống", value: "system" },
                                        { label: "Quán ăn", value: "restaurant" }
                                    ]
                                },
                                {
                                    key: "type",
                                    label: "Áp dụng",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Phí giao hàng", value: "ship" },
                                        { label: "Món ăn", value: "food" }
                                    ]
                                },
                                {
                                    key: "typeDiscount",
                                    label: "Loại chiết khấu",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Phần trăm", value: "percent" },
                                        { label: "Giá cố định", value: "amount" }
                                    ]
                                },
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Khả dụng", value: "active" },
                                        { label: "Đã ngừng", value: "inactive" }
                                    ]
                                }
                            ]}
                            onApply={(values) => {
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    typeVoucher: values.typeVoucher === "system" ? "SYSTEM" : values.typeVoucher === "restaurant" ? "RESTAURANT" : undefined,
                                    type: values.type === "ship" ? "SHIP" : values.type === "food" ? "FOOD" : undefined,
                                    typeDiscount: values.typeDiscount === "amount" ? "AMOUNT" : values.typeDiscount === "percent" ? "PERCENT" : undefined,
                                    status: values.status === "active" ? "ACTIVE" : values.status === "inactive" ? "INACTIVE" : undefined
                                }))
                            }}
                        />
                    </div>
                </div>

                {!isLoading && (
                    <DataTable
                        headers={[
                            { label: "Mã", className: "w-[12%]", sortKey: "code", sortOrder: sortBy === "code" ? sortOrder : null, onSort: handleSort },
                            { label: "Loại", className: "w-[16%]", sortKey: "typeVoucher", sortOrder: sortBy === "typeVoucher" ? sortOrder : null, onSort: handleSort },
                            { label: "Áp dụng", className: "w-[16%]", sortKey: "type", sortOrder: sortBy === "type" ? sortOrder : null, onSort: handleSort },
                            { label: "Chiết khấu", className: "w-[18%]" },
                            { label: "Lượt dùng", className: "w-[14%]", sortKey: "usedQuantity", sortOrder: sortBy === "usedQuantity" ? sortOrder : null, onSort: handleSort },
                            { label: "Trạng thái", className: "w-[14%]", sortKey: "status", sortOrder: sortBy === "status" ? sortOrder : null, onSort: handleSort },
                            { label: "", className: "w-[10%]" }
                        ]}
                        rows={rows}
                        emptyMessage={"Không có mã khuyến mãi nào"}
                        emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo mã khuyễn mãi mới"}
                        emptyIcon={Ticket}
                    />
                )}

                {(!isLoading && pagination && vouchers.length > 0) && (
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

            <ResultDialog
                open={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                isSuccess={isResultSuccess}
                message={resultMessage}
            />

            {isLoading && (
                <LoadingOverlay message="Đang tải mã giảm giá" scope="content" />
            )}
        </div>
    )
}

export default VoucherPage