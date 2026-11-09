import { useEffect, useState } from "react"
import { format } from "date-fns"
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
import { deleteShipFee, getAllShipFee, updateShipFeeStatus } from "@/services/ship-fee.service"
import socket from "@/services/core/socket"
import type { GetAllShipFeeParams } from "@/types/shipfee.type"
import { shipFeeStatusConfig } from "@/utils/statusConfig"
import { Edit, EyeOff, Plus, RotateCcw, Trash, Truck } from "lucide-react"
import { useDialog } from "@/hooks/useDialog"
import { useTable } from "@/hooks/useTable"
import CreateShipFeeModal from "./CreateShipFeeModal"

const RULE_TYPE_LABELS: Record<string, string> = {
    BASE_FEE: "Phí cơ bản",
    PEAK_HOUR: "Giờ cao điểm",
    WEEKEND: "Cuối tuần",
    HOLIDAY: "Ngày lễ",
    WEATHER: "Thời tiết"
}

const getConfigText = (item: any) => {
    switch (item.ruleType) {
        case "BASE_FEE":
            return `${item.baseFee.toLocaleString("vi-VN")}đ + ${item.perKmFee.toLocaleString("vi-VN")}đ/km`
        case "PEAK_HOUR":
            return `×${item.multiplier} (${item.startTime}–${item.endTime})`
        case "HOLIDAY":
            return `×${item.multiplier} (${item.specialDate.replace("-", "/")})`
        default:
            return `×${item.multiplier}`
    }
}

function ShipFeePage() {
    const [searchInput, setSearchInput] = useState("")
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const { query, updateQuery, removeFilter, changePage, changePageSize, changeSort, data, isLoading, reload } = useTable(getAllShipFee, {
        currentPage: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "",
        status: undefined,
        ruleType: undefined,
        specialDate: undefined
    })

    const { confirm, result, openConfirm, closeConfirm, closeResult, runAction } = useDialog()
    const [shipFeeToAction, setShipFeeToAction] = useState({
        id: "",
        name: "",
        action: "hide" as "hide" | "active" | "delete"
    })

    const shipFees = data?.data.shipFee ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const handleShipFeeChange = () => { reload() }

        socket.on("shipfee:created", handleShipFeeChange)
        socket.on("shipfee:updated", handleShipFeeChange)
        socket.on("shipfee:deleted", handleShipFeeChange)

        return () => {
            socket.off("shipfee:created", handleShipFeeChange)
            socket.off("shipfee:updated", handleShipFeeChange)
            socket.off("shipfee:deleted", handleShipFeeChange)
        }
    }, [reload])

    const openShipFeeAction = (id: string, name: string, action: "hide" | "active" | "delete") => {
        setShipFeeToAction({ id, name, action })
        openConfirm()
    }

    const handleConfirmAction = async () => {
        await runAction(async () => {
            if (shipFeeToAction.action === "hide") {
                await updateShipFeeStatus(shipFeeToAction.id, "INACTIVE")
            }
            else if (shipFeeToAction.action === "active") {
                await updateShipFeeStatus(shipFeeToAction.id, "ACTIVE")
            }
            else {
                await deleteShipFee(shipFeeToAction.id)
            }
            reload()
        }, shipFeeToAction.action === "hide"
            ? "Phí giao hàng đã được ẩn thành công."
            : shipFeeToAction.action === "active"
                ? "Phí giao hàng đã được khôi phục thành công."
                : "Phí giao hàng đã được xóa thành công.")
    }

    const rows = shipFees.map((shipFee: any) => {
        const status = shipFeeStatusConfig[shipFee.status]
        const canDelete = shipFee.status !== "DELETED"

        return {
            id: shipFee._id,
            cells: [
                <span className="font-medium text-foreground">{shipFee.name}</span>,
                <Badge tone="brand">{RULE_TYPE_LABELS[shipFee.ruleType] ?? shipFee.ruleType}</Badge>,
                <span className="font-medium text-foreground">{getConfigText(shipFee)}</span>,
                <Badge tone={status?.tone ?? "neutral"}>{status?.label ?? shipFee.status}</Badge>,
                <RowActions
                    label={shipFee.name ?? "phí giao hàng"}
                    actions={[
                        {
                            label: "Chỉnh sửa",
                            icon: <Edit className="size-4" />,
                            onClick: () => { }
                        },
                        {
                            label: shipFee.status === "ACTIVE" ? "Tạm ngừng" : "Khôi phục",
                            icon: shipFee.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                            onClick: () => openShipFeeAction(shipFee._id, shipFee.name, shipFee.status === "ACTIVE" ? "hide" : "active")
                        },
                        ...(canDelete ? [{
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openShipFeeAction(shipFee._id, shipFee.name, "delete")
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
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Phí giao hàng</h2>
                    <p className="text-sm text-text-secondary">
                        Phí giao hàng cho toàn hệ thống.
                    </p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full shrink-0 sm:w-auto"
                >
                    <Plus className="size-4" />
                    Thêm phí giao hàng
                </Button>
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${shipFeeStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.ruleType !== undefined ? [{ key: "ruleType", label: `Loại phí: ${RULE_TYPE_LABELS[query.ruleType]}` }] : []),
                            ...(query.specialDate !== undefined ? [{ key: "specialDate", label: `Ngày: ${query.specialDate}` }] : [])
                        ]}
                        onRemove={(key) => {
                            removeFilter(key)
                            if (key === "search") setSearchInput("")
                            if (key === "specialDate") setSpecialDateFilter(undefined)
                        }}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên..."
                                onSearch={() => updateQuery({ search: searchInput.trim() })}
                            />
                        </div>

                        <DatePicker
                            id="shipfee-filter-special-date"
                            value={specialDateFilter}
                            onChange={(date) => {
                                setSpecialDateFilter(date)
                                updateQuery({ specialDate: date ? format(date, "dd-MM") : undefined })
                            }}
                            mode="day-month"
                            iconOnly
                        />

                        <Filter
                            values={{
                                status: query.status?.toLowerCase() ?? "all",
                                ruleType: query.ruleType?.toLowerCase().replace("_", "-") ?? "all"
                            }}
                            groups={[
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Khả dụng", value: "active" },
                                        { label: "Tạm ngừng", value: "inactive" },
                                        { label: "Đã xóa", value: "deleted" }
                                    ]
                                },
                                {
                                    key: "ruleType",
                                    label: "Loại phí",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Giờ cao điểm", value: "peak-hour" },
                                        { label: "Cuối tuần", value: "weekend" },
                                        { label: "Ngày lễ", value: "holiday" },
                                        { label: "Thời tiết", value: "weather" }
                                    ]
                                }
                            ]}
                            onApply={(values) => {
                                updateQuery({
                                    status: values.status === "all" ? undefined : values.status.toUpperCase() as GetAllShipFeeParams["status"],
                                    ruleType: values.ruleType === "all" ? undefined : values.ruleType.toUpperCase().replace("-", "_") as GetAllShipFeeParams["ruleType"]
                                })
                            }}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tên phí", className: "w-[22%]", sortKey: "name", sortOrder: query.sortBy === "name" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Loại phí", className: "w-[18%]", sortKey: "ruleType", sortOrder: query.sortBy === "ruleType" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Cấu hình", className: "w-[32%]" },
                        { label: "Trạng thái", className: "w-[20%]", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: changeSort },
                        { label: "", className: "w-[8%]" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={query.pageSize}
                    emptyMessage="Không có phí giao hàng nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo phí giao hàng mới."
                    emptyIcon={Truck}
                />

                {(!isLoading && pagination && shipFees.length > 0) && (
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
                title={`${shipFeeToAction.action === "hide" ? "Tạm ngừng" : shipFeeToAction.action === "active" ? "Khôi phục" : "Xóa"} ${shipFeeToAction.name || "phí giao hàng"}?`}
                description={shipFeeToAction.action === "hide"
                    ? "Phí giao hàng sẽ không còn được áp dụng khi tính phí giao hàng."
                    : shipFeeToAction.action === "active"
                        ? "Phí giao hàng sẽ được áp dụng trở lại khi tính phí giao hàng."
                        : "Phí giao hàng sẽ bị xóa khỏi hệ thống."}
                confirmLabel={shipFeeToAction.action === "hide" ? "Tạm ngừng" : shipFeeToAction.action === "active" ? "Khôi phục" : "Xóa"}
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={closeResult}
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
