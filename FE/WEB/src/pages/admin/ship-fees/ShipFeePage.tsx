import { useState } from "react"
import { format } from "date-fns"
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
import useApiList from "@/hooks/useApiList "
import { deleteShipFee, getAllShipFee, restoreShipFee, updateShipFeeStatus } from "@/services/ship-fee.service"
import type { ShipFeeFilterValues } from "@/types/shipfee.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { shipFeeStatusConfig } from "@/utils/statusConfig"
import { shipFeeActionConfig } from "@/utils/actionConfig"
import { EyeOff, Plus, RotateCcw, Trash, Truck } from "lucide-react"
import CreateShipFeeModal from "./CreateShipFeeModal"
import PageHeader from "@/components/common/PageHeader"

const RULE_TYPE_LABELS: Record<string, string> = {
    BASE_FEE: "Phí cơ bản",
    PEAK_HOUR: "Giờ cao điểm",
    WEEKEND: "Cuối tuần",
    HOLIDAY: "Ngày lễ",
    WEATHER: "Thời tiết"
}

const getMultiplierText = (item: any) => {
    if (item.ruleType === "BASE_FEE") {
        return "—"
    }
    return `×${item.multiplier}`
}

const getBaseFeeText = (item: any) => {
    if (item.ruleType !== "BASE_FEE") {
        return "—"
    }
    return `${item.baseFee.toLocaleString("vi-VN")}đ`
}

const getPerKmFeeText = (item: any) => {
    if (item.ruleType !== "BASE_FEE") {
        return "—"
    }
    return `${item.perKmFee.toLocaleString("vi-VN")}đ/km`
}

const getApplyText = (item: any) => {
    if (item.ruleType === "PEAK_HOUR") {
        return `${item.startTime}–${item.endTime}`
    }
    if (item.ruleType === "HOLIDAY") {
        return item.specialDate?.replace("-", "/") ?? "—"
    }
    return "—"
}

function ShipFeePage() {
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const { items: shipFees, pagination, isLoading, query, setQuery, searchInput, setSearchInput, handleSort, handleSearch, handlePageChange, handlePageSizeChange } =
        useApiList({
            fetcher: getAllShipFee,
            getItems: (response: any) => response.data.shipFee,
            socketEvents: ["shipfee:created", "shipfee:updated", "shipfee:deleted", "connect"],
            onError: (error) => {
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
        })

    const handleApplyFilter = (values: ShipFeeFilterValues) => {
        setQuery((current: any) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            ruleType: values.ruleType === "all" ? undefined : values.ruleType,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
        }
        if (key === "specialDate") {
            setSpecialDateFilter(undefined)
        }
        setQuery((current: any) => ({
            ...current,
            [key]: undefined,
            page: 1
        }))
    }

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            switch (actionTarget.action) {
                case "hide":
                    await updateShipFeeStatus(actionTarget.id, "INACTIVE")
                    break
                case "restore":
                    await updateShipFeeStatus(actionTarget.id, "ACTIVE")
                    break
                case "restoreDeleted":
                    await restoreShipFee(actionTarget.id)
                    break
                case "delete":
                    await deleteShipFee(actionTarget.id)
                    break
            }
            setResult({
                isOpen: true,
                isSuccess: true,
                message: shipFeeActionConfig[actionTarget.action].message
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

    const rows = shipFees.map((shipFee: any) => {
        const status = shipFeeStatusConfig[shipFee.status]
        return {
            id: shipFee._id,
            cells: [
                <span className="block whitespace-nowrap font-medium text-foreground">{shipFee.name}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{getBaseFeeText(shipFee)}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{getPerKmFeeText(shipFee)}</span>,
                <span className="block whitespace-nowrap font-medium text-foreground">{getMultiplierText(shipFee)}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{getApplyText(shipFee)}</span>,
                <Badge tone="brand">{RULE_TYPE_LABELS[shipFee.ruleType] ?? shipFee.ruleType}</Badge>,
                <Badge tone={status?.tone ?? "neutral"}>{status?.label ?? shipFee.status}</Badge>,
                <RowActions
                    actions={[
                        {
                            label: shipFee.status === "ACTIVE" ? "Tạm ngừng" : shipFee.status === "DELETED" ? "Khôi phục từ thùng rác" : "Khôi phục",
                            icon: shipFee.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openAction(shipFee._id, shipFee.name, shipFee.status === "ACTIVE" ? "hide" : shipFee.status === "DELETED" ? "restoreDeleted" : "restore", shipFee.status === "ACTIVE" ? "Tạm ngừng" : "Khôi phục")
                        },
                        shipFee.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(shipFee._id, shipFee.name, "delete", "Xóa")
                        }
                    ]}
                />
            ]
        }
    })

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Thêm phí mới
        </Button>
    )

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Phí giao hàng"
                description="Quản lý phí giao hàng của hệ thống."
                action={createButton}
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${shipFeeStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.ruleType !== undefined ? [{ key: "ruleType", label: `Loại phí: ${RULE_TYPE_LABELS[query.ruleType]}` }] : []),
                            ...(query.specialDate !== undefined ? [{ key: "specialDate", label: `Ngày: ${query.specialDate}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <DatePicker
                            value={specialDateFilter}
                            onChange={(date) => {
                                setSpecialDateFilter(date)
                                setQuery((current: any) => ({
                                    ...current,
                                    specialDate: date ? format(date, "dd-MM") : undefined,
                                    page: 1
                                }))
                            }}
                            mode="day-month"
                            iconOnly
                        />

                        <Filter
                            values={{
                                status: query.status ?? "all",
                                ruleType: query.ruleType ?? "all"
                            }}
                            groups={[
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Khả dụng", value: "ACTIVE" },
                                        { label: "Tạm ngừng", value: "INACTIVE" },
                                        { label: "Đã xóa", value: "DELETED" }
                                    ]
                                },
                                {
                                    key: "ruleType",
                                    label: "Loại phí",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Giờ cao điểm", value: "PEAK_HOUR" },
                                        { label: "Cuối tuần", value: "WEEKEND" },
                                        { label: "Ngày lễ", value: "HOLIDAY" },
                                        { label: "Thời tiết", value: "WEATHER" }
                                    ]
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên phí", className: "w-56", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Phí cơ bản", className: "w-32 text-center" },
                        { label: "Phí mỗi km", className: "w-32 text-center" },
                        { label: "Hệ số", className: "w-28 text-center" },
                        { label: "Áp dụng", className: "w-36 text-center" },
                        { label: "Loại phí", className: "w-36 text-center", sortKey: "ruleType", sortOrder: query.sortBy === "ruleType" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Trạng thái", className: "w-32 text-center", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage="Không có phí giao hàng nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo phí giao hàng mới."
                    emptyIcon={Truck}
                    emptyAction={createButton}
                />

                {(pagination && shipFees.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name || "phí giao hàng"}?`}
                description={shipFeeActionConfig[actionTarget.action].description}
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

            <CreateShipFeeModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </div>
    )
}

export default ShipFeePage
