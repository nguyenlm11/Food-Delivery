import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
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
import { deleteVoucher, getAllVouchers, restoreVoucher, updateVoucherStatus } from "@/services/voucher.service"
import socket from "@/services/core/socket"
import type { GetAllVoucherParams, VoucherFilterValues } from "@/types/voucher.type"
import type { ActionTarget } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { voucherStatusConfig } from "@/utils/statusConfig"
import { voucherActionConfig } from "@/utils/actionConfig"
import { Edit, Eye, EyeOff, Plus, RotateCcw, Ticket, Trash } from "lucide-react"

function VoucherPage() {
    const [query, setQuery] = useState<GetAllVoucherParams>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
    const [voucherToAction, setVoucherToAction] = useState<ActionTarget>({ id: "", name: "", action: "hide" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const vouchers = data?.data.vouchers ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllVouchers(query)
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
        const handleVoucherChange = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("voucher:created", handleVoucherChange)
        socket.on("voucher:updated", handleVoucherChange)
        socket.on("voucher:deleted", handleVoucherChange)
        socket.on("voucher:restored", handleVoucherChange)

        return () => {
            socket.off("voucher:created", handleVoucherChange)
            socket.off("voucher:updated", handleVoucherChange)
            socket.off("voucher:deleted", handleVoucherChange)
            socket.off("voucher:restored", handleVoucherChange)
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

    const handleApplyFilter = (values: VoucherFilterValues) => {
        setQuery((current) => ({
            ...current,
            typeVoucher: values.typeVoucher === "all" ? undefined : values.typeVoucher,
            type: values.type === "all" ? undefined : values.type,
            typeDiscount: values.typeDiscount === "all" ? undefined : values.typeDiscount,
            status: values.status === "all" ? undefined : values.status,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setQuery((current) => ({ ...current, search: "", page: 1 }))
            return
        }
        if (key === "status") {
            setQuery((current) => ({ ...current, status: undefined, page: 1 }))
        }
        if (key === "typeVoucher") {
            setQuery((current) => ({ ...current, typeVoucher: undefined, page: 1 }))
        }
        if (key === "type") {
            setQuery((current) => ({ ...current, type: undefined, page: 1 }))
        }
        if (key === "typeDiscount") {
            setQuery((current) => ({ ...current, typeDiscount: undefined, page: 1 }))
        }
        if (key === "date") {
            setSpecialDateFilter(undefined)
            setQuery((current) => ({ ...current, date: undefined, page: 1 }))
        }
    }

    const openVoucherAction = (id: string, name: string, voucherStatus: string) => {
        const action = voucherStatus === "ACTIVE" ? "hide" : voucherStatus === "DELETED" ? "restoreDeleted" : "restore"
        setVoucherToAction({ id, name, action })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const openVoucherDelete = (id: string, name: string) => {
        setVoucherToAction({ id, name, action: "delete" })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            if (voucherToAction.action === "hide") {
                await updateVoucherStatus(voucherToAction.id, "INACTIVE")
            }
            else if (voucherToAction.action === "restore") {
                await updateVoucherStatus(voucherToAction.id, "ACTIVE")
            }
            else if (voucherToAction.action === "restoreDeleted") {
                await restoreVoucher(voucherToAction.id)
            }
            else {
                await deleteVoucher(voucherToAction.id)
            }
            setReloadKey((current) => current + 1)
            setResult({
                isOpen: true,
                isSuccess: true,
                message: voucherActionConfig[voucherToAction.action].message
            })
        }
        catch (error) {
            const response = getErrorData(error)
            setResult({
                isOpen: true,
                isSuccess: false,
                message: getLocalizedErrorMessage(response)
            })
        }
        finally {
            setConfirm((current) => ({ ...current, isProcessing: false, isOpen: false }))
        }
    }

    const rows = vouchers.map((voucher: any) => {
        const status = voucherStatusConfig[voucher.status]

        return {
            id: voucher._id,
            cells: [
                <span className="block whitespace-nowrap font-medium text-foreground">{voucher.name}</span>,
                <span className="block whitespace-nowrap font-mono font-medium text-foreground">{voucher.code}</span>,
                <span className="block whitespace-nowrap font-medium text-foreground">
                    {voucher.typeDiscount === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                </span>,
                <span className="block whitespace-nowrap text-muted-foreground">
                    {format(parseISO(String(voucher.endDate).slice(0, 10)), "dd/MM/yyyy")}
                </span>,
                <Badge tone={voucher.typeVoucher === "SYSTEM" ? "brand" : "info"}>
                    {voucher.typeVoucher === "SYSTEM" ? "Hệ thống" : "Quán ăn"}
                </Badge>,
                <Badge tone="neutral">
                    {voucher.type === "FOOD" ? "Món ăn" : "Phí giao hàng"}
                </Badge>,
                <Badge tone={status?.tone ?? "neutral"}>{status?.label ?? voucher.status}</Badge>,
                <RowActions
                    label={voucher.name ?? "mã giảm giá"}
                    actions={[
                        {
                            label: "Xem chi tiết",
                            icon: <Eye className="size-4" />,
                            onClick: () => { }
                        },
                        {
                            label: "Chỉnh sửa",
                            icon: <Edit className="size-4" />,
                            onClick: () => { }
                        },
                        {
                            label: voucher.status === "ACTIVE" ? voucherActionConfig.hide.label : voucher.status === "DELETED" ? voucherActionConfig.restoreDeleted.label : voucherActionConfig.restore.label,
                            icon: voucher.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openVoucherAction(voucher._id, voucher.name, voucher.status)
                        },
                        ...(voucher.status !== "DELETED" ? [{
                            label: voucherActionConfig.delete.label,
                            icon: <Trash className="size-4" />,
                            onClick: () => openVoucherDelete(voucher._id, voucher.name)
                        }] : [])
                    ]}
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
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[32%] lg:min-w-80">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo mã..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <DatePicker
                            id="voucher-filter-date"
                            value={specialDateFilter}
                            onChange={(date) => {
                                setSpecialDateFilter(date)
                                setQuery((current) => ({
                                    ...current,
                                    date: date ? format(date, "dd-MM-yyyy") : undefined,
                                    page: 1
                                }))
                            }}
                            mode="full"
                            iconOnly
                        />

                        <Filter
                            values={{
                                typeVoucher: query.typeVoucher ?? "all",
                                type: query.type ?? "all",
                                typeDiscount: query.typeDiscount ?? "all",
                                status: query.status ?? "all"
                            }}
                            groups={[
                                {
                                    key: "typeVoucher",
                                    label: "Loại mã",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Hệ thống", value: "SYSTEM" },
                                        { label: "Quán ăn", value: "RESTAURANT" }
                                    ]
                                },
                                {
                                    key: "type",
                                    label: "Áp dụng",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Phí giao hàng", value: "SHIP" },
                                        { label: "Món ăn", value: "FOOD" }
                                    ]
                                },
                                {
                                    key: "typeDiscount",
                                    label: "Loại chiết khấu",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Phần trăm", value: "PERCENT" },
                                        { label: "Giá cố định", value: "AMOUNT" }
                                    ]
                                },
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Khả dụng", value: "ACTIVE" },
                                        { label: "Tạm ngừng", value: "INACTIVE" },
                                        { label: "Hết hạn", value: "EXPIRED" },
                                        { label: "Đã xóa", value: "DELETED" }
                                    ]
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên", className: "min-w-56", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Mã", className: "min-w-32", sortKey: "code", sortOrder: query.sortBy === "code" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Chiết khấu", className: "min-w-32" },
                        { label: "Hết hạn", className: "min-w-32", sortKey: "endDate", sortOrder: query.sortBy === "endDate" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Nguồn", className: "min-w-32" },
                        { label: "Áp dụng", className: "min-w-36" },
                        { label: "Trạng thái", className: "min-w-32", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={10}
                    emptyMessage="Không có mã khuyến mãi nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo mã khuyễn mãi mới"
                    emptyIcon={Ticket}
                />

                {(!isLoading && pagination && vouchers.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                        onPageSizeChange={(size) => setQuery((current) => ({ ...current, limit: size, page: 1 }))}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${voucherActionConfig[voucherToAction.action].title} ${voucherToAction.name || "mã giảm giá"}?`}
                description={voucherActionConfig[voucherToAction.action].description}
                confirmLabel={voucherActionConfig[voucherToAction.action].confirmLabel}
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

export default VoucherPage
