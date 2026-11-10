import { useEffect, useState } from "react"
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
import { deleteUser, restoreUser, updateUserStatus } from "@/services/auth.service"
import { approveOwner, getAllOwners, rejectOwner } from "@/services/owner.service"
import socket from "@/services/core/socket"
import type { GetAllOwnerParams, OwnerFilterValues } from "@/types/owner.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { approvalStatusConfig, userStatusConfig } from "@/utils/statusConfig"
import { ownerActionConfig } from "@/utils/actionConfig"
import { Ban, Check, Eye, PersonStanding, RotateCcw, Trash, UserCheck, X } from "lucide-react"

function OwnerPage() {
    const [query, setQuery] = useState<GetAllOwnerParams>({
        page: 1,
        limit: 7,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "",
        status: undefined,
        approvalStatus: undefined
    })
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [ownerToAction, setOwnerToAction] = useState<ActionTarget>({ id: "", name: "", action: "approve" })

    const [dialog, setDialog] = useState({
        isConfirmOpen: false,
        isProcessing: false,
        isResultOpen: false,
        isSuccess: true,
        message: ""
    })

    const owners = data?.data.owners ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllOwners(query)
                setData(response)
            }
            catch {
                setData(null)
            }
            finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [query, reloadKey])

    useEffect(() => {
        const handleOwnerChange = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("owner:approved", handleOwnerChange)
        socket.on("owner:rejected", handleOwnerChange)
        socket.on("user:updated", handleOwnerChange)
        socket.on("user:deleted", handleOwnerChange)
        socket.on("user:restored", handleOwnerChange)

        return () => {
            socket.off("owner:approved", handleOwnerChange)
            socket.off("owner:rejected", handleOwnerChange)
            socket.off("user:updated", handleOwnerChange)
            socket.off("user:deleted", handleOwnerChange)
            socket.off("user:restored", handleOwnerChange)
        }
    }, [])

    const handleSearch = () => {
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
    }

    const handleApplyFilter = (values: OwnerFilterValues) => {
        setQuery((current) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            approvalStatus: values.approvalStatus === "all" ? undefined : values.approvalStatus,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setQuery((current) => ({ ...current, search: "", page: 1 }))
            return
        }
        if (key === "status") {
            setQuery((current) => ({ ...current, status: undefined, page: 1 }))
        }
        if (key === "approvalStatus") {
            setQuery((current) => ({ ...current, approvalStatus: undefined, page: 1 }))
        }
    }

    const openOwnerAction = (id: string, name: string, action: AdminAction) => {
        setOwnerToAction({ id, name, action })
        setDialog((current) => ({ ...current, isConfirmOpen: true }))
    }

    const handleConfirmAction = async (reason: string) => {
        if (ownerToAction.action === "reject" && !reason.trim()) {
            setDialog((current) => ({
                ...current,
                isSuccess: false,
                message: "Vui lòng nhập lý do từ chối.",
                isConfirmOpen: false,
                isResultOpen: true
            }))
            return
        }

        setDialog((current) => ({ ...current, isProcessing: true }))
        try {
            if (ownerToAction.action === "approve") {
                await approveOwner(ownerToAction.id)
            }
            else if (ownerToAction.action === "reject") {
                await rejectOwner(ownerToAction.id, reason.trim())
            }
            else if (ownerToAction.action === "restoreDeleted") {
                await restoreUser(ownerToAction.id)
            }
            else if (ownerToAction.action === "block") {
                await updateUserStatus(ownerToAction.id, "BLOCKED")
            }
            else if (ownerToAction.action === "unblock") {
                await updateUserStatus(ownerToAction.id, "ACTIVE")
            }
            else {
                await deleteUser(ownerToAction.id)
            }
            setReloadKey((current) => current + 1)
            setDialog((current) => ({
                ...current,
                isSuccess: true,
                message: ownerActionConfig[ownerToAction.action].message
            }))
        }
        catch (error) {
            const response = getErrorData(error)
            setDialog((current) => ({
                ...current,
                isSuccess: false,
                message: getLocalizedErrorMessage(response)
            }))
        }
        finally {
            setDialog((current) => ({
                ...current,
                isProcessing: false,
                isConfirmOpen: false,
                isResultOpen: true
            }))
        }
    }

    const rows = owners.map((owner: any) => {
        const user = owner.userId ?? {}
        const userId = user._id ?? ""
        const userStatus = userStatusConfig[user.status]
        const approvalStatus = approvalStatusConfig[owner.approvalStatus]
        const canReview = owner.approvalStatus === "PENDING" && user.status !== "DELETED"
        const canDelete = user.status !== "DELETED"
        const canRestore = user.status === "DELETED"

        return {
            id: owner._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.fullname} />}
                        <AvatarFallback name={user.fullname}>{(user.fullname ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block truncate font-medium text-foreground">{user.fullname ?? "N/A"}</span>
                </div>,
                <span className="block truncate font-medium text-foreground">{user.email ?? "N/A"}</span>,
                <span className="block truncate font-medium text-foreground">{user.phone ?? "N/A"}</span>,
                <Badge tone={userStatus?.tone ?? "neutral"}>{userStatus?.label ?? user.status ?? "N/A"}</Badge>,
                <Badge tone={approvalStatus?.tone ?? "neutral"}>{approvalStatus?.label ?? owner.approvalStatus}</Badge>,
                canReview || canDelete || canRestore ? (
                    <RowActions
                        label={user.fullname ?? "chủ nhà hàng"}
                        actions={[
                            {
                                label: "Xem chi tiết",
                                icon: <Eye className="size-4" />,
                                onClick: () => { }
                            },
                            ...(canReview ? [
                                {
                                    label: ownerActionConfig.approve.label,
                                    icon: <Check className="size-4" />,
                                    onClick: () => openOwnerAction(owner._id, user.fullname ?? "chủ nhà hàng", "approve")
                                },
                                {
                                    label: ownerActionConfig.reject.label,
                                    icon: <X className="size-4" />,
                                    onClick: () => openOwnerAction(owner._id, user.fullname ?? "chủ nhà hàng", "reject")
                                }
                            ] : []),
                            ...(canDelete ? [{
                                label: ownerActionConfig.delete.label,
                                icon: <Trash className="size-4" />,
                                onClick: () => openOwnerAction(userId, user.fullname ?? "chủ nhà hàng", "delete")
                            }] : []),
                            ...(canDelete && user.status === "BLOCKED" ? [{
                                label: ownerActionConfig.unblock.label,
                                icon: <UserCheck className="size-4" />,
                                onClick: () => openOwnerAction(userId, user.fullname ?? "chủ nhà hàng", "unblock")
                            }] : []),
                            ...(canDelete && user.status !== "BLOCKED" ? [{
                                label: ownerActionConfig.block.label,
                                icon: <Ban className="size-4" />,
                                onClick: () => openOwnerAction(userId, user.fullname ?? "chủ nhà hàng", "block")
                            }] : []),
                            ...(canRestore ? [{
                                label: ownerActionConfig.restoreDeleted.label,
                                icon: <RotateCcw className="size-4" />,
                                onClick: () => openOwnerAction(userId, user.fullname ?? "chủ nhà hàng", "restoreDeleted")
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
                        { label: "Chủ quán", className: "w-[30%]" },
                        { label: "Email", className: "w-[28%]" },
                        { label: "Số điện thoại", className: "w-[15%]" },
                        { label: "Trạng thái", className: "w-[17%]" },
                        { label: "Xác nhận", className: "w-[14%]" },
                        { label: "", className: "w-[10%]" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={query.limit}
                    emptyMessage="Không có chủ quán ăn nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo chủ nhà hàng mới"
                    emptyIcon={PersonStanding}
                />

                {(!isLoading && pagination && owners.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={query.limit}
                        onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                        onPageSizeChange={(size) => setQuery((current) => ({ ...current, limit: size, page: 1 }))}
                    />
                )}
            </section>

            <ConfirmDialog
                open={dialog.isConfirmOpen}
                onOpenChange={(open) => setDialog((current) => ({ ...current, isConfirmOpen: open }))}
                title={`${ownerActionConfig[ownerToAction.action].title} ${ownerToAction.name || "chủ nhà hàng"}?`}
                description={ownerActionConfig[ownerToAction.action].description}
                confirmLabel={ownerActionConfig[ownerToAction.action].confirmLabel}
                reasonLabel={ownerActionConfig[ownerToAction.action].reasonLabel}
                reasonPlaceholder="Nhập lý do từ chối..."
                loading={dialog.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={dialog.isResultOpen}
                onOpenChange={(open) => setDialog((current) => ({ ...current, isResultOpen: open }))}
                isSuccess={dialog.isSuccess}
                message={dialog.message}
            />
        </div>
    )
}

export default OwnerPage
