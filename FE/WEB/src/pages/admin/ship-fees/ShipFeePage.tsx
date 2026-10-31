import { useEffect, useState } from "react"
import ConfirmDialog from "@/components/ConfirmDialog"
import DataTable from "@/components/data-table/DataTable"
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
import type { ShipFeeParams } from "@/types/shipfee.type"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"
import type { AxiosError } from "axios"
import { Edit, EyeOff, Plus, RotateCcw, Trash, Truck, X } from "lucide-react"
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
    const [shipFeeResponse, setShipFeeResponse] = useState<any>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    const [isShipFeeDialogOpen, setIsShipFeeDialogOpen] = useState(false)
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [shipFeeToAction, setShipFeeToAction] = useState<{ id: string, name: string }>()
    const [shipFeeAction, setShipFeeAction] = useState<"hide" | "active" | "delete">("active")
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<ShipFeeParams>({ search: "", status: undefined, ruleType: undefined })

    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const loadShipFees = async () => {
            try {
                const response = await getAllShipFee({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    status: params.status,
                    ruleType: params.ruleType
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
    }, [currentPage, pageSize, params, reloadKey])

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
        setIsShipFeeDialogOpen(false)
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
            setIsResultDialogOpen(true)
        }
    }

    const shipFeeItems = shipFees.map((shipFee: any) => ({
        id: shipFee._id,
        name: shipFee.name,
        status: shipFee.status,
        ruleType: shipFee.ruleType,
        baseFee: shipFee.baseFee,
        perKmFee: shipFee.perKmFee,
        multiplier: shipFee.multiplier,
        startTime: shipFee.startTime,
        endTime: shipFee.endTime,
        specialDate: shipFee.specialDate
    }))

    const rows = shipFeeItems.map((item: any) => ({
        id: item.id,
        cells: [
            <span className="font-medium text-foreground">{item.name}</span>,
            <Badge tone="brand">{RULE_TYPE_LABELS[item.ruleType] ?? item.ruleType}</Badge>,
            <span className="font-medium text-foreground">{getConfigText(item)}</span>,
            <Badge tone={item.status === "ACTIVE" ? "success" : item.status === "INACTIVE" ? "warning" : "error"}>
                {item.status === "ACTIVE" ? "Khả dụng" : item.status === "INACTIVE" ? "Tạm ngừng" : "Đã xóa"}
            </Badge>,
            <RowActions
                label={item.name}
                actions={[
                    {
                        label: "Chỉnh sửa",
                        icon: <Edit />,
                        onClick: () => { }
                    },
                    {
                        label: item.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục",
                        icon: item.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                        onClick: () => openShipFeeAction(item.id, item.name, item.status === "ACTIVE" ? "hide" : "active")
                    },
                    ...(item.status !== "DELETED" ? [{
                        label: "Xóa phí",
                        icon: <Trash />,
                        onClick: () => openShipFeeAction(item.id, item.name, "delete")
                    }] : [])
                ]}
            />
        ]
    }))

    return (
        <div className="space-y-6">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

                <Filter
                    className="w-full sm:w-auto"
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

            {(params.search || params.status !== undefined || params.ruleType !== undefined) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Đang lọc:</span>

                    {params.search && (
                        <div className="inline-flex h-8 items-center gap-1 rounded-md border border-brand-primary-hover bg-brand-primary pl-3 pr-1 text-sm text-primary-foreground">
                            <span>Từ khóa: {params.search}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-primary-foreground hover:bg-brand-primary-hover hover:text-primary-foreground"
                                onClick={() => {
                                    setCurrentPage(1)
                                    setSearchInput("")
                                    setParams((currentParams) => ({
                                        ...currentParams,
                                        search: ""
                                    }))
                                }}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    )}

                    {params.status !== undefined && (
                        <div className="inline-flex h-8 items-center gap-1 rounded-md border border-brand-primary-hover bg-brand-primary pl-3 pr-1 text-sm text-primary-foreground">
                            <span>Trạng thái: {params.status === "ACTIVE" ? "Khả dụng" : params.status === "INACTIVE" ? "Tạm ngừng" : "Đã xóa"}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-primary-foreground hover:bg-brand-primary-hover hover:text-primary-foreground"
                                onClick={() => {
                                    setCurrentPage(1)
                                    setParams((currentParams) => ({
                                        search: currentParams.search,
                                        ruleType: currentParams.ruleType
                                    }))
                                }}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    )}

                    {params.ruleType !== undefined && (
                        <div className="inline-flex h-8 items-center gap-1 rounded-md border border-brand-primary-hover bg-brand-primary pl-3 pr-1 text-sm text-primary-foreground">
                            <span>Loại phí: {RULE_TYPE_LABELS[params.ruleType]}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-primary-foreground hover:bg-brand-primary-hover hover:text-primary-foreground"
                                onClick={() => {
                                    setCurrentPage(1)
                                    setParams((currentParams) => ({
                                        search: currentParams.search,
                                        status: currentParams.status
                                    }))
                                }}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <section className="overflow-hidden rounded-xl border bg-card">
                {!isLoading && (
                    <DataTable
                        headers={["Tên phí", "Loại phí", "Cấu hình", "Trạng thái", ""]}
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
                title={`${shipFeeAction === "hide" ? "Tạm ẩn" : shipFeeAction === "active" ? "Khôi phục" : "Xóa"} ${shipFeeToAction?.name ?? ""}?`}
                description={shipFeeAction === "hide" ? "Phí giao hàng sẽ không còn được áp dụng khi tính phí giao hàng." : shipFeeAction === "active"
                    ? "Phí giao hàng sẽ được áp dụng trở lại khi tính phí giao hàng." : "Phí giao hàng sẽ bị xóa khỏi hệ thống."}
                confirmLabel={shipFeeAction === "hide" ? "Tạm ẩn" : shipFeeAction === "active" ? "Khôi phục" : "Xóa"}
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

            {(isLoading || isProcessing) && (
                <LoadingOverlay message={isLoading ? "Đang tải phí giao hàng" : "Đang xử lý phí giao hàng"} scope="content" />
            )}
        </div>
    )
}

export default ShipFeePage