import { useEffect, useState } from "react"
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
import { deleteUser, restoreUser, updateUserStatus } from "@/services/auth.service"
import { approveOwner, getAllOwners, rejectOwner } from "@/services/owner.service"
import socket from "@/services/core/socket"
import type { GetOwnersQuery, OwnerFilterValues } from "@/types/owner.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { approvalStatusConfig, userStatusConfig } from "@/utils/statusConfig"
import { ownerActionConfig } from "@/utils/actionConfig"
import { Ban, Check, PersonStanding, RotateCcw, Trash, UserCheck, X } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"

function OwnerPage() {
    const [query, setQuery] = useState<GetOwnersQuery>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "approve", title: "" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const owners = data?.data.owners ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllOwners(query)
                setData(response)
            }
            catch (error) {
                setData(null)
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
            finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [query, reloadKey])

    useEffect(() => {
        const handleReload = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("owner:created", handleReload)
        socket.on("owner:updated", handleReload)
        socket.on("user:created", handleReload)
        socket.on("user:updated", handleReload)
        socket.on("user:deleted", handleReload)
        socket.on("connect", handleReload)

        return () => {
            socket.off("owner:created", handleReload)
            socket.off("owner:updated", handleReload)
            socket.off("user:created", handleReload)
            socket.off("user:updated", handleReload)
            socket.off("user:deleted", handleReload)
            socket.off("connect", handleReload)
        }
    }, [])

    const handleSort = (key: string) => {
        setIsLoading(true)
        setQuery((current) => ({
            ...current,
            sortBy: key,
            sortOrder: current.sortBy === key ? (current.sortOrder === "asc" ? "desc" : "asc") : "asc",
            page: 1
        }))
    }

    const handleSearch = () => {
        setIsLoading(true)
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
    }

    const handleApplyFilter = (values: OwnerFilterValues) => {
        setIsLoading(true)
        setQuery((current) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            approvalStatus: values.approvalStatus === "all" ? undefined : values.approvalStatus,
            page: 1
        }))
    }

    const handleRemoveFilter = (key: string) => {
        setIsLoading(true)
        if (key === "search") {
            setQuery((current) => ({ ...current, search: "", page: 1 }))
        }
        if (key === "status") {
            setQuery((current) => ({ ...current, status: undefined, page: 1 }))
        }
        if (key === "approvalStatus") {
            setQuery((current) => ({ ...current, approvalStatus: undefined, page: 1 }))
        }
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
        const user = owner.userId ?? {}
        const userId = user._id ?? ""
        const userStatus = userStatusConfig[user.status]
        const approvalStatus = approvalStatusConfig[owner.approvalStatus]
        return {
            id: owner._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.fullname} />}
                        <AvatarFallback name={user.fullname}>{(user.fullname ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block whitespace-nowrap font-medium text-foreground">{user.fullname ?? "N/A"}</span>
                </div>,
                <span className="block whitespace-nowrap font-medium text-foreground">{user.email ?? "N/A"}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{user.phone ?? "N/A"}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{owner.taxCode || "—"}</span>,
                <Badge tone={userStatus?.tone ?? "neutral"}>{userStatus?.label ?? user.status ?? "N/A"}</Badge>,
                <Badge tone={approvalStatus?.tone ?? "neutral"}>{approvalStatus?.label ?? owner.approvalStatus}</Badge>,
                <RowActions
                    actions={[
                        owner.approvalStatus === "PENDING" && user.status !== "DELETED" && {
                            label: "Duyệt",
                            icon: <Check className="size-4" />,
                            onClick: () => openAction(owner._id, user.fullname ?? "chủ nhà hàng", "approve", "Duyệt")
                        },
                        owner.approvalStatus === "PENDING" && user.status !== "DELETED" && {
                            label: "Từ chối",
                            icon: <X className="size-4" />,
                            onClick: () => openAction(owner._id, user.fullname ?? "chủ nhà hàng", "reject", "Từ chối")
                        },
                        user.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(userId, user.fullname ?? "chủ nhà hàng", "delete", "Xóa")
                        },
                        user.status === "BLOCKED" && {
                            label: "Bỏ chặn",
                            icon: <UserCheck className="size-4" />,
                            onClick: () => openAction(userId, user.fullname ?? "chủ nhà hàng", "unblock", "Bỏ chặn")
                        },
                        user.status !== "BLOCKED" && user.status !== "DELETED" && {
                            label: "Chặn",
                            icon: <Ban className="size-4" />,
                            onClick: () => openAction(userId, user.fullname ?? "chủ nhà hàng", "block", "Chặn")
                        },
                        user.status === "DELETED" && {
                            label: "Khôi phục",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(userId, user.fullname ?? "chủ nhà hàng", "restoreDeleted", "Khôi phục")
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
                        { label: "Chủ quán", className: "w-56", sortKey: "fullname", sortOrder: query.sortBy === "fullname" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Email", className: "w-44" },
                        { label: "Số điện thoại", className: "w-40 text-center" },
                        { label: "Mã số thuế", className: "w-36 text-center" },
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
                        onPageChange={(page) => { setIsLoading(true); setQuery((current) => ({ ...current, page })) }}
                        onPageSizeChange={(size) => { setIsLoading(true); setQuery((current) => ({ ...current, limit: size, page: 1 })) }}
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
