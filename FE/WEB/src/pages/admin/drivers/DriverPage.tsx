import { useState } from "react"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import useApiList from "@/hooks/useApiList "
import { deleteUser, restoreUser, updateUserStatus } from "@/services/auth.service"
import { getAllDrivers } from "@/services/driver.service"
import type { DriverFilterValues } from "@/types/driver.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { driverStatusConfig, userStatusConfig } from "@/utils/statusConfig"
import { driverActionConfig } from "@/utils/actionConfig"
import { Ban, RotateCcw, Trash, Truck, UserCheck } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { formatDate } from "@/utils/dateFormat"

const DRIVER_ACTIVITY_BADGE: Record<string, { className: string }> = {
    ONLINE: { className: "bg-badge-success-bg text-badge-success-fg" },
    OFFLINE: { className: "bg-badge-neutral-bg text-badge-neutral-fg" },
    BUSY: { className: "bg-badge-warning-bg text-badge-warning-fg" },
    SUSPENDED: { className: "bg-badge-error-bg text-badge-error-fg" }
}

function DriverPage() {
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "delete", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const { items: drivers, pagination, isLoading, query, setQuery, searchInput, setSearchInput, handleSort, handleSearch, handlePageChange, handlePageSizeChange } =
        useApiList({
            fetcher: getAllDrivers,
            getItems: (response: any) => response.data.drivers,
            socketEvents: ["driver:created", "driver:updated", "user:created", "user:updated", "user:deleted", "connect"],
            onError: (error) => {
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
        })

    const handleApplyFilter = (values: DriverFilterValues) => {
        setQuery((current: any) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
            driverStatus: values.driverStatus === "all" ? undefined : values.driverStatus,
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

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            switch (actionTarget.action) {
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
                message: driverActionConfig[actionTarget.action].message
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

    const rows = drivers.map((driver: any) => {
        const userStatus = userStatusConfig[driver.userId?.status]
        const driverStatus = driverStatusConfig[driver.status]
        const activityBadge = DRIVER_ACTIVITY_BADGE[driver.status]
        return {
            id: driver._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {driver.userId?.avatar && <AvatarImage src={driver.userId.avatar} alt={driver.userId.fullname} />}
                        <AvatarFallback name={driver.userId?.fullname}>{(driver.userId?.fullname ?? "").trim().charAt(0).toUpperCase()}</AvatarFallback>
                        <AvatarBadge
                            className={activityBadge?.className}
                            title={driverStatus?.label ?? driver.status}
                            aria-label={`Trạng thái hoạt động: ${driverStatus?.label ?? driver.status}`}
                        >
                        </AvatarBadge>
                    </Avatar>
                    <span className="block whitespace-nowrap font-medium text-foreground">{driver.userId?.fullname}</span>
                </div>,
                <span className="block whitespace-nowrap font-medium text-foreground">{driver.userId?.email}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{driver.userId?.phone}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{formatDate(driver.userId?.birthday)}</span>,
                <div className="flex flex-col gap-0.5 ">
                    <span className="block whitespace-nowrap font-medium text-foreground">{driver.vehicleModel}</span>
                    <span className="block whitespace-nowrap text-muted-foreground">{driver.licensePlate}</span>
                </div>,
                <Badge tone={userStatus?.tone}>{userStatus?.label ?? driver.userId?.status}</Badge>,
                <RowActions
                    actions={[
                        driver.userId?.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(driver.userId._id, driver.userId?.fullname ?? "tài xế", "delete", "Xóa")
                        },
                        driver.userId?.status === "BLOCKED" && {
                            label: "Bỏ chặn",
                            icon: <UserCheck className="size-4" />,
                            onClick: () => openAction(driver.userId._id, driver.userId?.fullname ?? "tài xế", "unblock", "Bỏ chặn")
                        },
                        driver.userId?.status !== "BLOCKED" && driver.userId?.status !== "DELETED" && {
                            label: "Chặn",
                            icon: <Ban className="size-4" />,
                            onClick: () => openAction(driver.userId._id, driver.userId?.fullname ?? "tài xế", "block", "Chặn")
                        },
                        driver.userId?.status === "DELETED" && {
                            label: "Khôi phục",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(driver.userId._id, driver.userId?.fullname ?? "tài xế", "restoreDeleted", "Khôi phục")
                        }
                    ]}
                />
            ]
        }
    })

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Tài xế"
                description="Quản lý tài xế của hệ thống."
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${userStatusConfig[query.status]?.label || query.status}` }] : []),
                            ...(query.driverStatus !== undefined ? [{ key: "driverStatus", label: `Hoạt động: ${driverStatusConfig[query.driverStatus]?.label || query.driverStatus}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />

                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center lg:w-[38%] lg:min-w-96">
                        <div className="min-w-0 flex-1">
                            <Search
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Tìm theo tên, email hoặc biển số..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <Filter
                            values={{
                                status: query.status ?? "all",
                                driverStatus: query.driverStatus ?? "all"
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
                                    key: "driverStatus",
                                    label: "Hoạt động",
                                    options: [
                                        { label: "Tất cả", value: "all" },
                                        { label: "Đang hoạt động", value: "ONLINE" },
                                        { label: "Đang ngoại tuyến", value: "OFFLINE" },
                                        { label: "Đang giao hàng", value: "BUSY" },
                                        { label: "Bị tạm dừng", value: "SUSPENDED" }
                                    ]
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Tài xế", className: "w-48", sortKey: "fullname", sortOrder: query.sortBy === "fullname" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Email", className: "w-44" },
                        { label: "Số điện thoại", className: "w-40 text-center" },
                        { label: "Ngày sinh", className: "w-32 text-center" },
                        { label: "Phương tiện", className: "w-40 text-center" },
                        { label: "Trạng thái", className: "w-32 text-center" },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage="Không có tài xế nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo tài xế mới"
                    emptyIcon={Truck}
                />

                {(pagination && drivers.length > 0) && (
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
                title={`${actionTarget.title} ${actionTarget.name || "tài xế"}?`}
                description={driverActionConfig[actionTarget.action].description}
                confirmLabel={actionTarget.title}
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

export default DriverPage
