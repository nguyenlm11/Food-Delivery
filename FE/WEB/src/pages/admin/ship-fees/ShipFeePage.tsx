import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import LoadingOverlay from "@/components/LoadingOverlay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllShipFee } from "@/services/shipfee.service"
import type { BackendErrorResponse } from "@/types/api"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"
import type { AxiosError } from "axios"
import { EyeOff, Plus, RotateCcw, Trash, Truck, X } from "lucide-react"
import { useEffect, useState } from "react"

interface ShipFeeParams {
    search: string
    status?: "ACTIVE" | "INACTIVE" | "DELETED"
    ruleType?: "BASE_FEE" | "PEAK_HOUR" | "WEEKEND" | "HOLIDAY" | "WEATHER"
}

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

    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [reloadKey, setReloadKey] = useState(0)
    const [params, setParams] = useState<ShipFeeParams>({ search: "", status: undefined, ruleType: undefined })


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



    const shipFees = shipFeeResponse?.data.shipFee ?? []
    const pagination = shipFeeResponse?.data.pagination


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
            <Badge tone={item.status === "ACTIVE" ? "success" : item.status === "INACTIVE" ? "warning" : "error"}            >
                {item.status === "ACTIVE" ? "Khả dụng" : item.status === "INACTIVE" ? "Tạm ngừng" : "Đã xóa"}
            </Badge>,
            <RowActions
                label={item.name}
                actions={[
                    {
                        label: item.status === "ACTIVE" ? "Tạm ẩn" : "Khôi phục",
                        icon: item.status === "ACTIVE" ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                        onClick: () => { }
                    },
                    {
                        label: "Xóa phí",
                        icon: <Trash />,
                        onClick: () => { }
                    }
                ]}
            />
        ]
    }))

    const overlayMessage = isLoading ? "Đang tải phí giao hàng" : "Đang xử lý phí giao hàng"

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
                    onClick={() => { }}
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
                        totalItems={pagination.totalItems}
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



            {(isLoading || isProcessing) && (
                <LoadingOverlay message={overlayMessage} scope="content" />
            )}
        </div>
    )
}

export default ShipFeePage