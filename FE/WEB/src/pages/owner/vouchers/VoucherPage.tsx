import { useState } from "react"
import { format, parseISO } from "date-fns"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import ResultDialog from "@/components/common/ResultDialog"
import DatePicker from "@/components/common/DatePicker"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ActionTarget, AdminAction } from "@/types/api"
import type { VoucherStatus, VoucherType, VoucherTypeDiscount } from "@/types/voucher.type"
import { voucherActionConfig } from "@/utils/actionConfig"
import { voucherStatusConfig } from "@/utils/statusConfig"
import { EyeOff, Plus, RotateCcw, Ticket, Trash } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CreateVoucherModal from "./CreateVoucherModal"
import type { OwnerVoucher, OwnerVoucherFilterValues } from "./voucher.type"

const INITIAL_VOUCHERS: OwnerVoucher[] = [
    {
        _id: "voucher-01",
        name: "Giảm 20% món nước",
        code: "PHO20",
        type: "FOOD",
        typeDiscount: "PERCENT",
        discountValue: 20,
        endDate: "2026-12-31",
        status: "ACTIVE"
    },
    {
        _id: "voucher-02",
        name: "Giảm 15k phí giao hàng",
        code: "SHIP15K",
        type: "SHIP",
        typeDiscount: "AMOUNT",
        discountValue: 15000,
        endDate: "2026-11-30",
        status: "ACTIVE"
    },
    {
        _id: "voucher-03",
        name: "Combo trưa giảm 30k",
        code: "COMBO30K",
        type: "FOOD",
        typeDiscount: "AMOUNT",
        discountValue: 30000,
        endDate: "2026-10-15",
        status: "INACTIVE"
    }
]

function VoucherPage() {
    const [vouchers, setVouchers] = useState<OwnerVoucher[]>(INITIAL_VOUCHERS)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [type, setType] = useState<"all" | VoucherType>("all")
    const [typeDiscount, setTypeDiscount] = useState<"all" | VoucherTypeDiscount>("all")
    const [status, setStatus] = useState<"all" | VoucherStatus>("all")
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const filteredVouchers = vouchers.filter((voucher) => {
        const keyword = search.trim().toLowerCase()

        if (keyword && !voucher.code.toLowerCase().includes(keyword) && !voucher.name.toLowerCase().includes(keyword)) {
            return false
        }

        if (type !== "all" && voucher.type !== type) {
            return false
        }

        if (typeDiscount !== "all" && voucher.typeDiscount !== typeDiscount) {
            return false
        }

        if (status !== "all" && voucher.status !== status) {
            return false
        }

        if (specialDateFilter) {
            const endDate = format(parseISO(voucher.endDate), "yyyy-MM-dd")
            if (endDate !== format(specialDateFilter, "yyyy-MM-dd")) {
                return false
            }
        }

        return true
    })

    const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / pageSize))
    const currentPage = Math.min(page, totalPages)
    const visibleVouchers = filteredVouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))

        try {
            if (actionTarget.action === "hide") {
                setVouchers((current) => current.map(voucher => voucher._id === actionTarget.id ? { ...voucher, status: "INACTIVE" } : voucher))
            }
            else if (actionTarget.action === "restore" || actionTarget.action === "restoreDeleted") {
                setVouchers((current) => current.map(voucher => voucher._id === actionTarget.id ? { ...voucher, status: "ACTIVE" } : voucher))
            }
            else {
                setVouchers((current) => current.map(voucher => voucher._id === actionTarget.id ? { ...voucher, status: "DELETED" } : voucher))
            }

            setResult({
                isOpen: true,
                isSuccess: true,
                message: voucherActionConfig[actionTarget.action].message
            })
        }
        finally {
            setConfirm((current) => ({ ...current, isProcessing: false, isOpen: false }))
        }
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setSearch("")
        }
        if (key === "type") {
            setType("all")
        }
        if (key === "typeDiscount") {
            setTypeDiscount("all")
        }
        if (key === "status") {
            setStatus("all")
        }
        if (key === "date") {
            setSpecialDateFilter(undefined)
        }

        setPage(1)
    }

    const rows = visibleVouchers.map((voucher) => {
        const statusItem = voucherStatusConfig[voucher.status]

        return {
            id: voucher._id,
            cells: [
                <span className="block whitespace-nowrap font-medium text-foreground">{voucher.name}</span>,
                <span className="block whitespace-nowrap font-mono font-medium text-foreground">{voucher.code}</span>,
                <span className="block whitespace-nowrap font-medium text-foreground">
                    {voucher.typeDiscount === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                </span>,
                <span className="block whitespace-nowrap text-muted-foreground">{format(parseISO(voucher.endDate), "dd/MM/yyyy")}</span>,
                <Badge tone="neutral">{voucher.type === "FOOD" ? "Món ăn" : "Phí giao hàng"}</Badge>,
                <Badge tone={statusItem?.tone ?? "neutral"}>{statusItem?.label ?? voucher.status}</Badge>,
                <RowActions
                    actions={[
                        {
                            label: voucher.status === "ACTIVE" ? "Tạm ngừng" : voucher.status === "DELETED" ? "Khôi phục từ thùng rác" : "Khôi phục",
                            icon: voucher.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openAction(voucher._id, voucher.name, voucher.status === "ACTIVE" ? "hide" : voucher.status === "DELETED" ? "restoreDeleted" : "restore", voucher.status === "ACTIVE" ? "Tạm ngừng" : "Khôi phục")
                        },
                        voucher.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(voucher._id, voucher.name, "delete", "Xóa")
                        }
                    ]}
                />
            ]
        }
    })

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Tạo mã giảm giá
        </Button>
    )

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Mã giảm giá"
                description="Quản lý mã giảm giá riêng của nhà hàng."
                action={createButton}
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(search ? [{ key: "search", label: `Từ khóa: ${search}` }] : []),
                            ...(type !== "all" ? [{ key: "type", label: `Áp dụng: ${type === "FOOD" ? "Món ăn" : "Phí giao hàng"}` }] : []),
                            ...(typeDiscount !== "all" ? [{ key: "typeDiscount", label: `Chiết khấu: ${typeDiscount === "PERCENT" ? "Phần trăm" : "Giá cố định"}` }] : []),
                            ...(status !== "all" ? [{ key: "status", label: `Trạng thái: ${voucherStatusConfig[status]?.label ?? status}` }] : []),
                            ...(specialDateFilter ? [{ key: "date", label: `Ngày: ${format(specialDateFilter, "dd/MM/yyyy")}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[32%] lg:min-w-80">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo mã..."
                                onSearch={() => {
                                    setSearch(searchInput.trim())
                                    setPage(1)
                                }}
                            />
                        </div>

                        <DatePicker
                            value={specialDateFilter}
                            onChange={setSpecialDateFilter}
                            iconOnly
                        />

                        <Filter
                            values={{ type, typeDiscount, status }}
                            groups={[
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
                            onApply={(values: OwnerVoucherFilterValues) => {
                                setType(values.type)
                                setTypeDiscount(values.typeDiscount)
                                setStatus(values.status)
                                setPage(1)
                            }}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên", className: "min-w-56" },
                        { label: "Mã", className: "min-w-32" },
                        { label: "Chiết khấu", className: "min-w-32" },
                        { label: "Hết hạn", className: "min-w-32" },
                        { label: "Áp dụng", className: "min-w-36" },
                        { label: "Trạng thái", className: "min-w-32" },
                        { label: "Thao tác", className: "w-14" }
                    ]}
                    rows={rows}
                    emptyMessage="Chưa có mã giảm giá nào"
                    emptyDescription="Tạo mã giảm giá riêng để thu hút khách hàng cho nhà hàng."
                    emptyIcon={Ticket}
                    emptyAction={createButton}
                />

                {filteredVouchers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredVouchers.length}
                        pageSize={pageSize}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setPage(1)
                        }}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name || "mã giảm giá"}?`}
                description={voucherActionConfig[actionTarget.action].description}
                confirmLabel={actionTarget.title}
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />

            <CreateVoucherModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreated={(voucher) => setVouchers((current) => [...current, voucher])}
            />
        </div>
    )
}

export default VoucherPage
