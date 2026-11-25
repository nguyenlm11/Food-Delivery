import { useState } from "react"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import useApiList from "@/hooks/useApiList "
import { deleteUser, restoreUser, updateUserStatus } from "@/services/auth.service"
import { approveOwner, getAllOwners, rejectOwner } from "@/services/owner.service"
import type { OwnerFilterValues } from "@/types/owner.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { approvalStatusConfig, userStatusConfig } from "@/utils/statusConfig"
import { ownerActionConfig } from "@/utils/actionConfig"
import { Ban, Check, PersonStanding, RotateCcw, Trash, UserCheck, X } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { formatDate } from "@/utils/dateFormat"

function OwnerPage() {
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "approve", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const { items: owners, pagination, isLoading, query, setQuery, searchInput, setSearchInput, handleSort, handleSearch, handlePageChange, handlePageSizeChange } =
        useApiList({
            fetcher: getAllOwners,
            getItems: (response: any) => response.data.owners,
            socketEvents: ["owner:created", "owner:updated", "user:created", "user:updated", "user:deleted", "connect"],
            onError: (error) => {
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
        })

    const handleApplyFilter = (values: OwnerFilterValues) => {
        setQuery((current: any) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            approvalStatus: values.approvalStatus === "all" ? undefined : values.approvalStatus,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
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

    const handleConfirmAction = async (reason: string) => {
        if (actionTarget.action === "reject" && !reason.trim()) {
            setResult({ isOpen: true, isSuccess: false, message: "Vui lòng nhập lý do từ chối." })
            setConfirm((current) => ({ ...current, isOpen: false }))
            return
        }

        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            switch (actionTarget.action) {
                case "approve":
                    await approveOwner(actionTarget.id)
                    break
                case "reject":
                    await rejectOwner(actionTarget.id, reason.trim())
                    break
                case "block":
                    await updateUserStatus(actionTarget.id, "BLOCKED")
                    break
                case "restoreDeleted":
                    await restoreUser(actionTarget.id)
                    break
                case "unblock":
                    await updateUserStatus(actionTarget.id, "ACTIVE")
                    break
                case "delete":
                    await deleteUser(actionTarget.id)
                    break
            }
            setResult({
                isOpen: true,
                isSuccess: true,
                message: ownerActionConfig[actionTarget.action].message
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

    const rows = owners.map((owner: any) => {
        const userStatus = userStatusConfig[owner.userId.status]
        const approvalStatus = approvalStatusConfig[owner.approvalStatus]
        return {
            id: owner._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {owner.userId.avatar && <AvatarImage src={owner.userId.avatar} alt={owner.userId.fullname} />}
                        <AvatarFallback name={owner.userId.fullname}>{(owner.userId.fullname).trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block whitespace-nowrap font-medium text-foreground">{owner.userId.fullname}</span>
                </div>,
                <span className="block whitespace-nowrap font-medium text-foreground">{owner.userId.email}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{owner.userId.phone}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{formatDate(owner.userId.birthday)}</span>,
                <Badge tone={userStatus?.tone}>{userStatus?.label ?? owner.userId.status}</Badge>,
                <Badge tone={approvalStatus?.tone}>{approvalStatus?.label ?? owner.approvalStatus}</Badge>,
                <RowActions
                    actions={[
                        owner.approvalStatus === "PENDING" && owner.userId.status !== "DELETED" && {
                            label: "Duyệt",
                            icon: <Check className="size-4" />,
                            onClick: () => openAction(owner._id, owner.userId.fullname ?? "chủ nhà hàng", "approve", "Duyệt")
                        },
                        owner.approvalStatus === "PENDING" && owner.userId.status !== "DELETED" && {
                            label: "Từ chối",
                            icon: <X className="size-4" />,
                            onClick: () => openAction(owner._id, owner.userId.fullname ?? "chủ nhà hàng", "reject", "Từ chối")
                        },
                        owner.userId.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(owner.userId._id, owner.userId.fullname ?? "chủ nhà hàng", "delete", "Xóa")
                        },
                        owner.userId.status === "BLOCKED" && {
                            label: "Bỏ chặn",
                            icon: <UserCheck className="size-4" />,
                            onClick: () => openAction(owner.userId._id, owner.userId.fullname ?? "chủ nhà hàng", "unblock", "Bỏ chặn")
                        },
                        owner.userId.status !== "BLOCKED" && owner.userId.status !== "DELETED" && {
                            label: "Chặn",
                            icon: <Ban className="size-4" />,
                            onClick: () => openAction(owner.userId._id, owner.userId.fullname ?? "chủ nhà hàng", "block", "Chặn")
                        },
                        owner.userId.status === "DELETED" && {
                            label: "Khôi phục",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(owner.userId._id, owner.userId.fullname ?? "chủ nhà hàng", "restoreDeleted", "Khôi phục")
                        }
                    ]}
                />
            ]
        }
    })

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Chủ quán"
                description="Quản lý chủ quán ăn của hệ thống."
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${userStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.approvalStatus !== undefined ? [{ key: "approvalStatus", label: `Trạng thái xác nhận: ${approvalStatusConfig[query.approvalStatus]?.label || query.approvalStatus}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên hoặc email..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <Filter
                            values={{
                                status: query.status ?? "all",
                                approvalStatus: query.approvalStatus ?? "all",
                            }}
                            groups={[
                                {
                                    key: "status",
                                    label: "Trạng thái",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Hoạt động", value: "ACTIVE" },
                                        { label: "Không hoạt động", value: "INACTIVE" },
                                        { label: "Đang chờ", value: "PENDING" },
                                        { label: "Bị chặn", value: "BLOCKED" },
                                        { label: "Đã xóa", value: "DELETED" }
                                    ]
                                },
                                {
                                    key: "approvalStatus",
                                    label: "Trạng thái xác nhận",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Đã xác nhận", value: "APPROVED" },
                                        { label: "Đang chờ", value: "PENDING" },
                                        { label: "Từ chối", value: "REJECTED" }
                                    ]
                                },
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Chủ quán", className: "w-48", sortKey: "fullname", sortOrder: query.sortBy === "fullname" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Email", className: "w-44" },
                        { label: "Số điện thoại", className: "w-40 text-center" },
                        { label: "Ngày sinh", className: "w-36 text-center" },
                        { label: "Trạng thái", className: "w-32 text-center" },
                        { label: "Xác nhận", className: "w-32 text-center", sortKey: "approvalStatus", sortOrder: query.sortBy === "approvalStatus" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage="Không có chủ quán ăn nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo chủ nhà hàng mới"
                    emptyIcon={PersonStanding}
                />

                {(pagination && owners.length > 0) && (
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
                title={`${actionTarget.title} ${actionTarget.name || "chủ nhà hàng"}?`}
                description={ownerActionConfig[actionTarget.action].description}
                confirmLabel={actionTarget.title}
                reasonLabel={ownerActionConfig[actionTarget.action].reasonLabel}
                reasonPlaceholder="Nhập lý do từ chối..."
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

export default OwnerPage
