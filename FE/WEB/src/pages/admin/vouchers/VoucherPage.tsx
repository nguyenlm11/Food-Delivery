import { useState } from "react"
import { format, parseISO } from "date-fns"
import type { AxiosError } from "axios"
import ConfirmDialog from "@/components/ConfirmDialog"
import ResultDialog from "@/components/ResultDialog"
import DatePicker from "@/components/DatePicker"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllVouchers } from "@/services/voucher.service"
import type { BackendErrorResponse } from "@/types/api"
import type { GetAllVoucherParams } from "@/types/voucher.type"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { voucherStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Ticket } from "lucide-react"
import { useDialog } from "@/hooks/useDialog"
import { useTable } from "@/hooks/useTable"

function VoucherPage() {
    const [searchInput, setSearchInput] = useState("")
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
    const { query, updateQuery, removeFilter, changePage, changePageSize, changeSort, data, isLoading } = useTable(getAllVouchers, {
        currentPage: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "",
        status: undefined,
        typeVoucher: undefined,
        type: undefined,
        typeDiscount: undefined,
        date: undefined
    })

    const { confirm, result, openConfirm, closeConfirm, setProcessing, showResult, closeResult } = useDialog()
    const [voucherToAction, setVoucherToAction] = useState({ id: "", name: "" })

    const vouchers = data?.data.vouchers ?? []
    const pagination = data?.data.pagination

    const openVoucherAction = (id: string, name: string) => {
        setVoucherToAction({ id, name })
        openConfirm()
    }

    const handleConfirmAction = async () => {
        setProcessing(true)
        try {

        }
        catch (error) {
            const response = (error as AxiosError<BackendErrorResponse>).response?.data
            showResult(false, getLocalizedErrorMessage(response))
        }
        finally {
            setProcessing(false)
            closeConfirm(false)
        }
    }

    const rows = vouchers.map((voucher: any) => {
        const status = voucherStatusConfig[voucher.status]

        return {
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
                    {format(parseISO(String(voucher.endDate).slice(0, 10)), "dd/MM/yyyy")}
                </span>,
                <Badge tone={status?.tone ?? "neutral"}>{status?.label ?? voucher.status}</Badge>,
                <RowActions
                    label={voucher.name ?? "mã giảm giá"}
                    actions={[{
                        label: voucher.status === "ACTIVE" ? "Tạm ngừng" : "Khôi phục",
                        icon: voucher.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                        onClick: () => openVoucherAction(voucher._id, voucher.name)
                    }]}
                />
            ]
        }
    })

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
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${voucherStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.typeVoucher !== undefined ? [{ key: "typeVoucher", label: `Loại: ${query.typeVoucher === "SYSTEM" ? "Hệ thống" : "Quán ăn"}` }] : []),
                            ...(query.type !== undefined ? [{ key: "type", label: `Áp dụng: ${query.type === "FOOD" ? "Món ăn" : "Phí giao hàng"}` }] : []),
                            ...(query.typeDiscount !== undefined ? [{ key: "typeDiscount", label: `Chiết khấu: ${query.typeDiscount === "PERCENT" ? "Phần trăm" : "Giá cố định"}` }] : []),
                            ...(query.date !== undefined ? [{ key: "date", label: `Ngày: ${query.date}` }] : [])
                        ]}
                        onRemove={(key) => {
                            removeFilter(key)
                            if (key === "search") setSearchInput("")
                        }}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[32%] lg:min-w-80">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo mã..."
                                onSearch={() => updateQuery({ search: searchInput.trim() })}
                            />
                        </div>

                        <DatePicker
                            id="voucher-filter-date"
                            value={specialDateFilter}
                            onChange={(date) => {
                                setSpecialDateFilter(date)
                                updateQuery({ date: date ? format(date, "dd-MM-yyyy") : undefined })
                            }}
                            mode="full"
                            iconOnly
                        />

                        <Filter
                            values={{
                                typeVoucher: query.typeVoucher?.toLowerCase() ?? "all",
                                type: query.type?.toLowerCase() ?? "all",
                                typeDiscount: query.typeDiscount?.toLowerCase() ?? "all",
                                status: query.status?.toLowerCase() ?? "all"
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
                                        { label: "Tạm ngừng", value: "inactive" },
                                        { label: "Hết hạn", value: "expired" }
                                    ]
                                }
                            ]}
                            onApply={(values) => {
                                updateQuery({
                                    typeVoucher: values.typeVoucher === "all" ? undefined : values.typeVoucher.toUpperCase() as GetAllVoucherParams["typeVoucher"],
                                    type: values.type === "all" ? undefined : values.type.toUpperCase() as GetAllVoucherParams["type"],
                                    typeDiscount: values.typeDiscount === "all" ? undefined : values.typeDiscount.toUpperCase() as GetAllVoucherParams["typeDiscount"],
                                    status: values.status === "all" ? undefined : values.status.toUpperCase() as GetAllVoucherParams["status"]
                                })
                            }}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Mã", className: "w-[15%]", sortKey: "code", sortOrder: query.sortBy === "code" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Loại", className: "w-[13%]", sortKey: "typeVoucher", sortOrder: query.sortBy === "typeVoucher" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Áp dụng", className: "w-[14%]", sortKey: "type", sortOrder: query.sortBy === "type" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Chiết khấu", className: "w-[12%]" },
                        { label: "Hết hạn", className: "w-[13%]", sortKey: "endDate", sortOrder: query.sortBy === "endDate" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Trạng thái", className: "w-[14%]", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: changeSort },
                        { label: "", className: "w-[8%]" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={query.pageSize}
                    emptyMessage="Không có mã khuyến mãi nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo mã khuyễn mãi mới"
                    emptyIcon={Ticket}
                />

                {(!isLoading && pagination && vouchers.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={query.pageSize}
                        onPageChange={changePage}
                        onPageSizeChange={changePageSize}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={closeConfirm}
                title={`Tạm ngừng ${voucherToAction.name || "mã giảm giá"}?`}
                description="Mã giảm giá sẽ không còn được sử dụng bởi khách hàng."
                confirmLabel="Tạm ngừng"
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={closeResult}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

export default VoucherPage
