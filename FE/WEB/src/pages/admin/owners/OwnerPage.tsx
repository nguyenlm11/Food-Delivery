import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import Search from "@/components/data-table/Search"
import LoadingOverlay from "@/components/LoadingOverlay"
import { EyeOff, PersonStanding, RotateCcw } from "lucide-react"
import type { GetAllOwnerParams } from "@/types/owner.type"
import { getAllOwners } from "@/services/owner.service"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import RowActions from "@/components/data-table/RowActions"

type StatusConfig = {
    label: string;
    tone: "success" | "warning" | "error" | "neutral" | "brand" | "info";
};

const statusConfig: Record<string, StatusConfig> = {
    ACTIVE: { label: "Hoạt động", tone: "success" },
    INACTIVE: { label: "Không hoạt động", tone: "neutral" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    BLOCKED: { label: "Bị chặn", tone: "error" },
    DELETED: { label: "Bị xóa", tone: "error" },
};

type ApprovalStatusTone = "success" | "warning" | "error";

const approvalStatusConfig: Record<string, { label: string; tone: ApprovalStatusTone }> = {
    APPROVED: { label: "Đã xác nhận", tone: "success" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    REJECTED: { label: "Từ chối", tone: "error" },
};

function OwnerPage() {
    const [ownersResponse, setOwnersResponse] = useState<any>(null)

    const [isLoading, setIsLoading] = useState(true)
    // const [isProcessing, setIsProcessing] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [params, setParams] = useState<GetAllOwnerParams>({ search: "", status: undefined, approvalStatus: undefined })

    useEffect(() => {
        const loadOwners = async () => {
            try {
                const response = await getAllOwners({
                    page: currentPage,
                    limit: pageSize,
                    search: params.search,
                    status: params.status,
                    approvalStatus: params.approvalStatus,
                })
                setOwnersResponse(response)
                console.log(response.data)
            }
            catch (error) {
                setOwnersResponse(null)
            }
            finally {
                setIsLoading(false)
            }
        }
        void loadOwners()
    }, [currentPage, pageSize, params])

    const owners = ownersResponse?.data?.owners ?? []
    const pagination = ownersResponse?.data?.pagination

    const rows = owners.map((owner: any) => {
        const user = owner.userId ?? {};
        return {
            id: owner._id,
            cells: [
                <span className="block truncate font-medium text-foreground">{user.fullname ?? "N/A"}</span>,
                <span className="block truncate font-medium text-foreground">{user.email ?? "N/A"}</span>,
                <span className="block truncate font-medium text-foreground">{user.phone ?? "N/A"}</span>,
                <span className="block truncate font-medium text-foreground">{user.birthday ? new Date(user.birthday).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A"}</span>,
                <Badge tone={statusConfig[user.status]?.tone ?? "neutral"}>{statusConfig[user.status]?.label ?? user.status ?? "N/A"}</Badge>,
                <Badge tone={approvalStatusConfig[owner.approvalStatus]?.tone ?? "neutral"}>{approvalStatusConfig[owner.approvalStatus]?.label ?? owner.approvalStatus}</Badge>,
                <RowActions
                    label={owner.fullname}
                    actions={[{
                        label: owner.status ? "Tạm ẩn" : "Khôi phục",
                        icon: owner.status ? <EyeOff className="size-4" /> : <RotateCcw className="size-4" />,
                        // onClick: () => openCategoryAction(category._id, category.name, category.isActive ? "hide" : "active")
                    }]}
                />
            ]
        };
    })

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Chủ quán ăn</h2>
                    <p className="text-sm text-text-secondary">
                        Chủ quán ăn
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
                            ...(params.approvalStatus !== undefined ? [{ key: "approvalStatus", label: `Trạng thái xác nhận: ${approvalStatusConfig[params.approvalStatus]?.label || params.approvalStatus}` }] : []),
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
                                approvalStatus: params.approvalStatus === "APPROVED" ? "approved" : params.approvalStatus === "PENDING" ? "pending" : params.approvalStatus === "REJECTED" ? "rejected" : "all",
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
                                        { label: "Bị xóa", value: "deleted" }
                                    ]
                                },
                                {
                                    key: "approvalStatus",
                                    label: "Trạng thái xác nhận",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Đã xác nhận", value: "approved" },
                                        { label: "Đang chờ", value: "pending" },
                                        { label: "Từ chối", value: "rejected" }
                                    ]
                                },

                            ]}
                            onApply={(values) => {
                                setIsLoading(true)
                                setCurrentPage(1)
                                setParams((currentParams) => ({
                                    ...currentParams,
                                    status: values.status === "active" ? "ACTIVE" : values.status === "inactive" ? "INACTIVE" : values.status === "pending" ? "PENDING" : values.status === "blocked" ? "BLOCKED" : values.status === "deleted" ? "DELETED" : undefined,
                                    approvalStatus: values.approvalStatus === "approved" ? "APPROVED" : values.approvalStatus === "pending" ? "PENDING" : values.approvalStatus === "rejected" ? "REJECTED" : undefined,
                                }))
                            }}
                        />
                    </div>
                </div>

                {!isLoading && (
                    <DataTable
                        headers={[
                            { label: "Tên chủ quán", className: "w-[20%]" },
                            { label: "Email", className: "w-[20%]" },
                            { label: "Số điện thoại", className: "w-[13%]" },
                            { label: "Ngày sinh", className: "w-[12%]" },
                            { label: "Trạng thái", className: "w-[12%]" },
                            { label: "Trạng thái xác nhận", className: "w-[18%]" },
                            { label: "", className: "w-[5%]" }
                        ]}
                        rows={rows}
                        emptyMessage={"Không có chủ quán ăn nào"}
                        emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo chủ quán ăn mới"}
                        emptyIcon={PersonStanding}
                    />
                )}

                {(!isLoading && pagination && owners.length > 0) && (
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

            {isLoading && (
                <LoadingOverlay message="Đang tải danh sách chủ quán ăn" scope="content" />
            )}
        </div>
    )
}

export default OwnerPage