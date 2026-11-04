import { useEffect, useState } from "react"
import { format } from "date-fns"
import ConfirmDialog from "@/components/ConfirmDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import DatePicker from "@/components/DatePicker"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import LoadingOverlay from "@/components/LoadingOverlay"
import ResultDialog from "@/components/ResultDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteShipFee, getAllShipFee, updateShipFeeStatus } from "@/services/shipfee.service"
import socket from "@/services/socket"
import type { BackendErrorResponse } from "@/types/api"
import type { GetAllShipFeeParams } from "@/types/shipfee.type"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"
import type { AxiosError } from "axios"
import { Edit, EyeOff, Plus, RotateCcw, Trash, Truck } from "lucide-react"
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
    // Data
    const [shipFeeResponse, setShipFeeResponse] = useState<any>(null)

    // Processing
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    // Modal
    const [isShipFeeDialogOpen, setIsShipFeeDialogOpen] = useState(false)
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [shipFeeToAction, setShipFeeToAction] = useState<{ id: string, name: string }>()
    const [shipFeeAction, setShipFeeAction] = useState<"hide" | "active" | "delete">("active")
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")

    // Search, filter, pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [specialDateFilter, setSpecialDateFilter] = useState<Date>()
    const [params, setParams] = useState<GetAllShipFeeParams>({ search: "", status: undefined, ruleType: undefined, specialDate: undefined })
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    // Socket
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const loadShipFees = async () => {
            try {
                const response = await getAllShipFee({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    status: params.status,
                    ruleType: params.ruleType,
                    specialDate: params.specialDate,
                    sortBy,
                    sortOrder
                })
                setShipFeeResponse(response)
            }
            catch (error) {
                setShipFeeResponse(null)
                setIsResultSuccess(false)
                const response = (error as AxiosError<BackendErrorResponse>).response?.data
                setResultMessage(getLocalizedErrorMessage(response))
                setIsResultDialogOpen(true)
            }
            finally {
                setIsLoading(false)
            }
        }
        void loadShipFees()
    }, [currentPage, pageSize, params, sortBy, sortOrder, reloadKey])

    useEffect(() => {
        const handleShipFeeChange = () => { setReloadKey((currentKey) => currentKey + 1) }

        socket.on("shipfee:created", handleShipFeeChange)
        socket.on("shipfee:updated", handleShipFeeChange)
        socket.on("shipfee:deleted", handleShipFeeChange)

        return () => {
            socket.off("shipfee:created", handleShipFeeChange)
            socket.off("shipfee:updated", handleShipFeeChange)
            socket.off("shipfee:deleted", handleShipFeeChange)
        }
    })

    const shipFees = shipFeeResponse?.data.shipFee ?? []
    const pagination = shipFeeResponse?.data.pagination

    const openShipFeeAction = (id: string, name: string, action: "hide" | "active" | "delete") => {
        setShipFeeToAction({ id, name })
        setShipFeeAction(action)
        setIsShipFeeDialogOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!shipFeeToAction) return
        setIsProcessing(true)
        try {
            if (shipFeeAction === "hide") {
                await updateShipFeeStatus(shipFeeToAction.id, "INACTIVE")
                setResultMessage("Phí giao hàng đã được ẩn thành công.")
            }
            else if (shipFeeAction === "active") {
                await updateShipFeeStatus(shipFeeToAction.id, "ACTIVE")
                setResultMessage("Phí giao hàng đã được khôi phục thành công.")
            }
            else {
                await deleteShipFee(shipFeeToAction.id)
                setResultMessage("Phí giao hàng đã được xóa thành công.")
            }
            setIsResultSuccess(true)
        }
        catch (error) {
            setIsResultSuccess(false)
            const response = (error as AxiosError<BackendErrorResponse>).response?.data
            setResultMessage(getLocalizedErrorMessage(response))
        }
        finally {
            setIsProcessing(false)
            setIsShipFeeDialogOpen(false)
            setIsResultDialogOpen(true)
        }
    }

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

    const rows = shipFees.map((shipFee: any) => ({
        id: shipFee._id,
        cells: [
            <span className="font-medium text-foreground">{shipFee.name}</span>,
            <Badge tone="brand">{RULE_TYPE_LABELS[shipFee.ruleType] ?? shipFee.ruleType}</Badge>,
            <span className="font-medium text-foreground">{getConfigText(shipFee)}</span>,
            <Badge tone={shipFee.status === "ACTIVE" ? "success" : shipFee.status === "INACTIVE" ? "warning" : "error"} className="w-20 justify-center">
                {shipFee.status === "ACTIVE" ? "Khả dụng" : shipFee.status === "INACTIVE" ? "Tạm ngừng" : "Đã xóa"}
            </Badge>,
            <RowActions
                label={shipFee.name}
                actions={[
                    {
                        label: "Chỉnh sửa",
                        icon: <Edit />,
                        onClick: () => { }
                    },
                    {
                        label: shipFee.status === "ACTIVE" ? "Tạm ngừng" : "Khôi phục",
                        icon: shipFee.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                        onClick: () => openShipFeeAction(shipFee._id, shipFee.name, shipFee.status === "ACTIVE" ? "hide" : "active")
                    },
                    ...(shipFee.status !== "DELETED" ? [{
                        label: "Xóa",
                        icon: <Trash />,
                        onClick: () => openShipFeeAction(shipFee._id, shipFee.name, "delete")
                    }] : [])
                ]}
            />
        ]
    }))

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
                            ...(params.search ? [{ key: "search", label: `Từ khóa: ${params.search}` }] : []),
                            ...(params.status !== undefined ? [{ key: "status", label: `Trạng thái: ${params.status === "ACTIVE" ? "Khả dụng" : params.status === "INACTIVE" ? "Tạm ngừng" : "Đã xóa"}` }] : []),
                            ...(params.ruleType !== undefined ? [{ key: "ruleType", label: `Loại phí: ${RULE_TYPE_LABELS[params.ruleType]}` }] : []),
                            ...(params.specialDate !== undefined ? [{ key: "specialDate", label: `Ngày: ${params.specialDate}` }] : [])
                        ]}
                        onRemove={(key) => {
                            setCurrentPage(1)
                            if (key === "search") setSearchInput("")
                            if (key === "specialDate") setSpecialDateFilter(undefined)
                            setParams((currentParams) => ({ ...currentParams, [key]: undefined }))
                        }}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên..."
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
                            id="shipfee-filter-special-date"
                            value={specialDateFilter}
                            onChange={(date) => {
                                setSpecialDateFilter(date)
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    specialDate: date ? format(date, "dd-MM") : undefined
                                }))
                            }}
                            mode="day-month"
                            iconOnly
                        />

                        <Filter
                            values={{
                                status: params.status === "ACTIVE" ? "active" : params.status === "INACTIVE" ? "inactive" : params.status === "DELETED" ? "deleted" : "all",
                                ruleType: params.ruleType === "BASE_FEE" ? "base-fee" : params.ruleType === "PEAK_HOUR" ? "peak-hour" : params.ruleType === "WEEKEND" ? "weekend" : params.ruleType === "HOLIDAY" ? "holiday" : params.ruleType === "WEATHER" ? "weather" : "all"
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
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    status: values.status === "active" ? "ACTIVE" : values.status === "inactive" ? "INACTIVE" : values.status === "deleted" ? "DELETED" : undefined,
                                    ruleType: values.ruleType === "base-fee" ? "BASE_FEE" : values.ruleType === "peak-hour" ? "PEAK_HOUR" : values.ruleType === "weekend" ? "WEEKEND" : values.ruleType === "holiday" ? "HOLIDAY" : values.ruleType === "weather" ? "WEATHER" : undefined
                                }))
                            }}
                        />
                    </div>
                </div>

                {!isLoading && (
                    <DataTable
                        headers={[
                            { label: "Tên phí", className: 'w-[20%]', sortKey: "name", sortOrder: sortBy === "name" ? sortOrder : null, onSort: handleSort },
                            { label: "Loại phí", className: 'w-[20%]', sortKey: "ruleType", sortOrder: sortBy === "ruleType" ? sortOrder : null, onSort: handleSort },
                            { label: "Cấu hình", className: 'w-[30%]' },
                            { label: "Trạng thái", className: 'w-[20%]', sortKey: "status", sortOrder: sortBy === "status" ? sortOrder : null, onSort: handleSort },
                            { label: "", className: 'w-[10%]' },
                        ]}
                        rows={rows}
                        emptyMessage={"Không có phí giao hàng nào"}
                        emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo phí giao hàng mới."}
                        emptyIcon={Truck}
                    />
                )}

                {(!isLoading && pagination && shipFees.length > 0) && (
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

            <ConfirmDialog
                open={isShipFeeDialogOpen}
                onOpenChange={setIsShipFeeDialogOpen}
                title={`${shipFeeAction === "hide" ? "Tạm ngừng" : shipFeeAction === "active" ? "Khôi phục" : "Xóa"} ${shipFeeToAction?.name ?? ""}?`}
                description={shipFeeAction === "hide" ? "Phí giao hàng sẽ không còn được áp dụng khi tính phí giao hàng." : shipFeeAction === "active"
                    ? "Phí giao hàng sẽ được áp dụng trở lại khi tính phí giao hàng." : "Phí giao hàng sẽ bị xóa khỏi hệ thống."}
                confirmLabel={shipFeeAction === "hide" ? "Tạm ngừng" : shipFeeAction === "active" ? "Khôi phục" : "Xóa"}
                loading={isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                isSuccess={isResultSuccess}
                message={resultMessage}
            />

            <CreateShipFeeModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />

            {isLoading && (
                <LoadingOverlay message="Đang tải phí giao hàng" scope="content" />
            )}
        </div>
    )
}

export default ShipFeePage