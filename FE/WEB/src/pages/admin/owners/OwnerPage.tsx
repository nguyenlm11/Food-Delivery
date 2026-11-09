import { useState } from "react"
import ConfirmDialog from "@/components/ConfirmDialog"
import ResultDialog from "@/components/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { deleteUser } from "@/services/auth.service"
import { approveOwner, getAllOwners, rejectOwner } from "@/services/owner.service"
import type { GetAllOwnerParams } from "@/types/owner.type"
import { approvalStatusConfig, userStatusConfig } from "@/utils/statusConfig"
import { Check, PersonStanding, Trash, X } from "lucide-react"
import { useDialog } from "@/hooks/useDialog"
import { useTable } from "@/hooks/useTable"

function OwnerPage() {
    const [searchInput, setSearchInput] = useState("")
    const { query, updateQuery, removeFilter, changePage, changePageSize, data, isLoading, reload } = useTable(getAllOwners, {
        currentPage: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "",
        status: undefined,
        approvalStatus: undefined
    })

    const { confirm, result, openConfirm, closeConfirm, showResult, closeResult, runAction } = useDialog()
    const [ownerToAction, setOwnerToAction] = useState({
        id: "",
        name: "",
        userId: "",
        action: "approve" as "approve" | "reject" | "delete"
    })

    const owners = data?.data.owners ?? []
    const pagination = data?.data.pagination

    const openOwnerAction = (id: string, name: string, userId: string, action: "approve" | "reject" | "delete") => {
        setOwnerToAction({ id, name, userId, action })
        openConfirm()
    }

    const handleConfirmAction = async (reason: string) => {
        if (ownerToAction.action === "reject" && !reason.trim()) {
            showResult(false, "Vui lòng nhập lý do từ chối.")
            closeConfirm(false)
            return
        }

        await runAction(async () => {
            if (ownerToAction.action === "approve") {
                await approveOwner(ownerToAction.id)
            }
            else if (ownerToAction.action === "reject") {
                await rejectOwner(ownerToAction.id, reason.trim())
            }
            else {
                await deleteUser(ownerToAction.userId)
            }
            reload()
        }, ownerToAction.action === "approve"
            ? "Đã duyệt chủ nhà hàng thành công."
            : ownerToAction.action === "reject"
                ? "Đã từ chối yêu cầu của chủ nhà hàng."
                : "Tài khoản chủ nhà hàng đã được xóa thành công.")
    }

    const rows = owners.map((owner: any) => {
        const user = owner.userId ?? {}
        const userId = user._id ?? ""
        const userStatus = userStatusConfig[user.status]
        const approvalStatus = approvalStatusConfig[owner.approvalStatus]
        const canReview = owner.approvalStatus === "PENDING" && user.status !== "DELETED"
        const canDelete = user.status !== "DELETED"

        return {
            id: owner._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.fullname} />}
                        <AvatarFallback name={user.fullname}>{(user.fullname ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block truncate font-medium text-foreground">{user.fullname ?? "N/A"}</span>
                </div>,
                <span className="block truncate font-medium text-foreground">{user.email ?? "N/A"}</span>,
                <span className="block truncate font-medium text-foreground">{user.phone ?? "N/A"}</span>,
                <Badge tone={userStatus?.tone ?? "neutral"}>{userStatus?.label ?? user.status ?? "N/A"}</Badge>,
                <Badge tone={approvalStatus?.tone ?? "neutral"}>{approvalStatus?.label ?? owner.approvalStatus}</Badge>,
                canReview || canDelete ? (
                    <RowActions
                        label={user.fullname ?? "chủ nhà hàng"}
                        actions={[
                            ...(canReview ? [
                                {
                                    label: "Duyệt yêu cầu",
                                    icon: <Check className="size-4" />,
                                    onClick: () => openOwnerAction(owner._id, user.fullname ?? "chủ nhà hàng", userId, "approve")
                                },
                                {
                                    label: "Từ chối yêu cầu",
                                    icon: <X className="size-4" />,
                                    onClick: () => openOwnerAction(owner._id, user.fullname ?? "chủ nhà hàng", userId, "reject")
                                }
                            ] : []),
                            ...(canDelete ? [{
                                label: "Xóa tài khoản",
                                icon: <Trash className="size-4" />,
                                onClick: () => openOwnerAction(owner._id, user.fullname ?? "chủ nhà hàng", userId, "delete")
                            }] : [])
                        ]}
                    />
                ) : null
            ]
        }
    })

    return (
        <div className="space-y-3">
            <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Chủ quán ăn</h2>
                <p className="text-sm text-text-secondary">
                    Chủ quán ăn
                </p>
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${userStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.approvalStatus !== undefined ? [{ key: "approvalStatus", label: `Trạng thái xác nhận: ${approvalStatusConfig[query.approvalStatus]?.label || query.approvalStatus}` }] : []),
                        ]}
                        onRemove={(key) => {
                            removeFilter(key)
                            if (key === "search") setSearchInput("")
                        }}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên hoặc email..."
                                onSearch={() => updateQuery({ search: searchInput.trim() })}
                            />
                        </div>

                        <Filter
                            values={{
                                status: query.status?.toLowerCase() ?? "all",
                                approvalStatus: query.approvalStatus?.toLowerCase() ?? "all",
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
                                updateQuery({
                                    status: values.status === "all" ? undefined : values.status.toUpperCase() as GetAllOwnerParams["status"],
                                    approvalStatus: values.approvalStatus === "all" ? undefined : values.approvalStatus.toUpperCase() as GetAllOwnerParams["approvalStatus"],
                                })
                            }}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Chủ quán", className: "w-[30%]" },
                        { label: "Email", className: "w-[28%]" },
                        { label: "Số điện thoại", className: "w-[15%]" },
                        { label: "Trạng thái", className: "w-[17%]" },
                        { label: "Xác nhận", className: "w-[14%]" },
                        { label: "", className: "w-[10%]" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={query.pageSize}
                    emptyMessage="Không có chủ quán ăn nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo chủ nhà hàng mới"
                    emptyIcon={PersonStanding}
                />

                {(!isLoading && pagination && owners.length > 0) && (
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
                title={`${ownerToAction.action === "approve" ? "Duyệt" : ownerToAction.action === "reject" ? "Từ chối" : "Xóa tài khoản của"} ${ownerToAction.name || "chủ nhà hàng"}?`}
                description={ownerToAction.action === "approve"
                    ? "Chủ nhà hàng sẽ được xác minh và có thể tiếp tục sử dụng các chức năng dành cho đối tác."
                    : ownerToAction.action === "reject"
                        ? "Yêu cầu xác minh của chủ nhà hàng sẽ bị từ chối."
                        : "Tài khoản chủ nhà hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập."}
                confirmLabel={ownerToAction.action === "approve" ? "Duyệt" : ownerToAction.action === "reject" ? "Từ chối" : "Xóa tài khoản"}
                reasonLabel={ownerToAction.action === "reject" ? "Lý do từ chối" : undefined}
                reasonPlaceholder="Nhập lý do từ chối..."
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

export default OwnerPage
