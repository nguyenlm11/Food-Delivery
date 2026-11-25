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
import { getAllCustomers } from "@/services/customer.service"
import type { CustomerFilterValues } from "@/types/customer.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { userStatusConfig } from "@/utils/statusConfig"
import { customerActionConfig } from "@/utils/actionConfig"
import { formatDate } from "@/utils/dateFormat"
import { Ban, PersonStanding, RotateCcw, Trash, UserCheck } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"

function CustomerPage() {
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "delete", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const { items: customers, pagination, isLoading, query, setQuery, searchInput, setSearchInput, handleSort, handleSearch, handlePageChange, handlePageSizeChange } =
        useApiList({
            fetcher: getAllCustomers,
            getItems: (response: any) => response.data.customers,
            socketEvents: ["user:created", "user:updated", "user:deleted", "connect"],
            onError: (error) => {
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
        })

    const handleApplyFilter = (values: CustomerFilterValues) => {
        setQuery((current: any) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
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

    const rows = customers.map((customer: any) => {
        const statusConfig = userStatusConfig[customer.status]
        return {
            id: customer._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {customer.avatar && <AvatarImage src={customer.avatar} alt={customer.fullname} />}
                        <AvatarFallback name={customer.fullname}>{(customer.fullname).trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block whitespace-nowrap font-medium text-foreground">{customer.fullname}</span>
                </div>,
                <span className="block whitespace-nowrap font-medium text-foreground">{customer.email}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{customer.phone}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{formatDate(customer.birthday)}</span>,
                <Badge tone={statusConfig?.tone ?? "neutral"}>{statusConfig?.label ?? customer.status}</Badge>,
                <RowActions
                    actions={[
                        customer.status === "BLOCKED" && {
                            label: "Bỏ chặn",
                            icon: <UserCheck className="size-4" />,
                            onClick: () => openAction(customer._id, customer.fullname, "unblock", "Bỏ chặn")
                        },
                        customer.status !== "BLOCKED" && customer.status !== "DELETED" && {
                            label: "Chặn",
                            icon: <Ban className="size-4" />,
                            onClick: () => openAction(customer._id, customer.fullname, "block", "Chặn")
                        },
                        customer.status !== "DELETED" && {
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openAction(customer._id, customer.fullname, "delete", "Xóa")
                        },
                        customer.status === "DELETED" && {
                            label: "Khôi phục",
                            icon: <RotateCcw className="size-4" />,
                            onClick: () => openAction(customer._id, customer.fullname, "restoreDeleted", "Khôi phục")
                        }
                    ]}
                />
            ]
        }
    })

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Khách hàng"
                description="Quản lý khách hàng của hệ thống."
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="flex shrink-0 flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
                    <ActiveFilters
                        className="w-full lg:min-w-0 lg:flex-1"
                        filters={[
                            ...(query.search ? [{ key: "search", label: `Từ khóa: ${query.search}` }] : []),
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${userStatusConfig[query.status]?.label}` }] : [])
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
                            values={{ status: query.status ?? "all" }}
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
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Khách hàng", className: "w-42", sortKey: "fullname", sortOrder: query.sortBy === "fullname" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Email", className: "w-44" },
                        { label: "Số điện thoại", className: "w-40 text-center" },
                        { label: "Ngày sinh", className: "w-32 text-center"},
                        { label: "Trạng thái", className: "w-32", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    emptyMessage="Không có khách hàng nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo khách hàng mới"
                    emptyIcon={PersonStanding}
                />

                {(pagination && customers.length > 0) && (
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
                title={`${actionTarget.title} ${actionTarget.name || "khách hàng"}?`}
                description={customerActionConfig[actionTarget.action].description}
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

export default CustomerPage
