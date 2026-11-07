import { useEffect, useState } from "react"
import type { AxiosError } from "axios"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/ConfirmDialog"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import Search from "@/components/data-table/Search"
import LoadingOverlay from "@/components/LoadingOverlay"
import ResultDialog from "@/components/ResultDialog"
import { PersonStanding, Trash } from "lucide-react"
import type { GetAllCustomerParams } from "@/types/customer.type"
import { deleteCustomer, getAllCustomers } from "@/services/customer.service"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import RowActions from "@/components/data-table/RowActions"
import type { BackendErrorResponse } from "@/types/api"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"

type StatusConfig = {
    label: string;
    tone: "success" | "warning" | "error" | "neutral" | "brand" | "info";
};

const statusConfig: Record<string, StatusConfig> = {
    ACTIVE: { label: "Hoạt động", tone: "success" },
    INACTIVE: { label: "Không hoạt động", tone: "neutral" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    BLOCKED: { label: "Bị chặn", tone: "error" },
    DELETED: { label: "Đã xóa", tone: "error" },
};

function CustomerPage() {
    const [customersResponse, setCustomersResponse] = useState<any>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
    const [customerToAction, setCustomerToAction] = useState<{ id: string, name: string }>()
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<GetAllCustomerParams>({ search: "", status: undefined })
    const [sortBy, setSortBy] = useState<string>("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const response = await getAllCustomers({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    status: params.status,
                    sortBy,
                    sortOrder
                })
                setCustomersResponse(response)
            }
            catch (error) {
                setCustomersResponse(null)
            }
            finally {
                setIsLoading(false)
            }
        }
        void loadCustomers()
    }, [currentPage, pageSize, params, sortBy, sortOrder, reloadKey])

    const customers = customersResponse?.data.customers ?? []
    const pagination = customersResponse?.data.pagination

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

    const openCustomerAction = (id: string, name: string) => {
        setCustomerToAction({ id, name })
        setIsCustomerDialogOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!customerToAction) return

        setIsProcessing(true)
        try {
            await deleteCustomer(customerToAction.id)
            setResultMessage("Khách hàng đã được xóa thành công.")
            setIsResultSuccess(true)
            setIsLoading(true)
            setReloadKey((currentKey) => currentKey + 1)
        }
        catch (error) {
            setIsResultSuccess(false)
            const response = (error as AxiosError<BackendErrorResponse>).response?.data
            setResultMessage(getLocalizedErrorMessage(response))
        }
        finally {
            setIsProcessing(false)
            setIsCustomerDialogOpen(false)
            setIsResultDialogOpen(true)
        }
    }

    const rows = customers.map((customer: any) => ({
        id: customer._id,
        cells: [
            <img src={customer.avatar} className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-border-default" />,
            <span className="block truncate font-medium text-foreground">{customer.fullname}</span>,
            <span className="block truncate font-medium text-foreground">{customer.email}</span>,
            <span className="block truncate font-medium text-foreground">{customer.phone}</span>,
            <span className="block truncate font-medium text-foreground">{new Date(customer.birthday).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>,
            <Badge tone={statusConfig[customer.status].tone}>{statusConfig[customer.status].label}</Badge>,
            customer.status !== "DELETED" ? (
                <RowActions
                    label={customer.fullname}
                    actions={[{
                        label: "Xóa",
                        icon: <Trash className="size-4" />,
                        onClick: () => openCustomerAction(customer._id, customer.fullname)
                    }]}
                />
            ) : null
        ]
    }))

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Khách hàng</h2>
                    <p className="text-sm text-text-secondary">
                        Khách hàng của hệ thống và quán ăn
                    </p>
                </div>
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(params.search ? [{ key: "search", label: `Từ khóa: ${params.search}` }] : []),
                            ...(params.status !== undefined ? [{ key: "status", label: `Trạng thái: ${statusConfig[params.status]?.label || params.status}` }] : []),
                        ]}
                        onRemove={(key) => {
                            setCurrentPage(1)
                            if (key === "search") setSearchInput("")
                            setParams((currentParams) => ({ ...currentParams, [key]: undefined }))
                        }}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên hoặc email..."
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
                            values={{
                                status: params.status === "ACTIVE" ? "active" : params.status === "INACTIVE" ? "inactive" : params.status === "PENDING" ? "pending" : params.status === "BLOCKED" ? "blocked" : params.status === "DELETED" ? "deleted" : "all",
                            }}
                            groups={[
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Hoạt động", value: "active" },
                                        { label: "Không hoạt động", value: "inactive" },
                                        { label: "Đang chờ", value: "pending" },
                                        { label: "Bị chặn", value: "blocked" },
                                        { label: "Đã xóa", value: "deleted" }
                                    ]
                                }
                            ]}
                            onApply={(values) => {
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    status: values.status === "active" ? "ACTIVE" : values.status === "inactive" ? "INACTIVE" : values.status === "pending" ? "PENDING" : values.status === "blocked" ? "BLOCKED" : values.status === "deleted" ? "DELETED" : undefined,
                                }))
                            }}
                        />
                    </div>
                </div>

                {!isLoading && (
                    <DataTable
                        headers={[
                            { label: "Hình ảnh", className: "w-[10%]" },
                            { label: "Tên khách hàng", className: "w-[21%]", sortKey: "fullname", sortOrder: sortBy === "fullname" ? sortOrder : null, onSort: handleSort },
                            { label: "Email", className: "w-[25%]" },
                            { label: "Số điện thoại", className: "w-[14%]" },
                            { label: "Ngày sinh", className: "w-[11%]" },
                            { label: "Trạng thái", className: "w-[14%]", sortKey: "status", sortOrder: sortBy === "status" ? sortOrder : null, onSort: handleSort },
                            { label: "", className: "w-[5%]" }
                        ]}
                        rows={rows}
                        emptyMessage={"Không có khách hàng nào"}
                        emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo khách hàng mới"}
                        emptyIcon={PersonStanding}
                    />
                )}

                {(!isLoading && pagination && customers.length > 0) && (
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
                open={isCustomerDialogOpen}
                onOpenChange={setIsCustomerDialogOpen}
                title={`Xóa ${customerToAction?.name ?? "khách hàng"}?`}
                description="Tài khoản khách hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập."
                confirmLabel="Xóa khách hàng"
                loading={isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                isSuccess={isResultSuccess}
                message={resultMessage}
            />

            {isLoading && (
                <LoadingOverlay message="Đang tải danh sách khách hàng" scope="content" />
            )}
        </div>
    )
}

export default CustomerPage

