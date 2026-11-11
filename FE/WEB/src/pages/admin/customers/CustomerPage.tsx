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
import { getAllCustomers } from "@/services/customer.service"
import socket from "@/services/core/socket"
import type { CustomerFilterValues, GetAllCustomerParams } from "@/types/customer.type"
import type { ActionTarget, AdminAction } from "@/types/api"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { userStatusConfig } from "@/utils/statusConfig"
import { customerActionConfig } from "@/utils/actionConfig"
import { formatDate } from "@/utils/dateFormat"
import { Ban, Eye, PersonStanding, RotateCcw, Trash, UserCheck } from "lucide-react"

function CustomerPage() {
    const [query, setQuery] = useState<GetAllCustomerParams>({})
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const [searchInput, setSearchInput] = useState("")
    const [customerToAction, setCustomerToAction] = useState<ActionTarget>({ id: "", name: "", action: "delete" })

    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    const customers = data?.data.customers ?? []
    const pagination = data?.data.pagination

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getAllCustomers(query)
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
        const handleUserChange = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("user:updated", handleUserChange)
        socket.on("user:deleted", handleUserChange)
        socket.on("user:restored", handleUserChange)

        return () => {
            socket.off("user:updated", handleUserChange)
            socket.off("user:deleted", handleUserChange)
            socket.off("user:restored", handleUserChange)
        }
    }, [])

    const handleSort = (key: string) => {
        setQuery((current) => ({
            ...current,
            sortBy: key,
            sortOrder: current.sortBy === key ? (current.sortOrder === "asc" ? "desc" : "asc") : "asc",
            page: 1
        }))
    }

    const handleSearch = () => {
        setQuery((current) => ({ ...current, search: searchInput.trim(), page: 1 }))
    }

    const handleApplyFilter = (values: CustomerFilterValues) => {
        setQuery((current) => ({
            ...current,
            status: values.status === "all" ? undefined : values.status,
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
    }

    const openCustomerAction = (id: string, name: string, action: AdminAction) => {
        setCustomerToAction({ id, name, action })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))
        try {
            if (customerToAction.action === "restoreDeleted") {
                await restoreUser(customerToAction.id)
            }
            else if (customerToAction.action === "block") {
                await updateUserStatus(customerToAction.id, "BLOCKED")
            }
            else if (customerToAction.action === "unblock") {
                await updateUserStatus(customerToAction.id, "ACTIVE")
            }
            else {
                await deleteUser(customerToAction.id)
            }
            setReloadKey((current) => current + 1)
            setResult({
                isOpen: true,
                isSuccess: true,
                message: customerActionConfig[customerToAction.action].message
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

    const rows = customers.map((customer: any) => {
        const statusConfig = userStatusConfig[customer.status]
        const fullname = customer.fullname

        return {
            id: customer._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        {customer.avatar && <AvatarImage src={customer.avatar} alt={fullname} />}
                        <AvatarFallback name={fullname}>{(fullname ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block whitespace-nowrap font-medium text-foreground">{fullname}</span>
                </div>,
                <span className="block whitespace-nowrap text-muted-foreground">{customer.phone}</span>,
                <span className="block whitespace-nowrap font-medium text-foreground">{customer.email}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{formatDate(customer.birthday)}</span>,
                <span className="block whitespace-nowrap text-muted-foreground">{customer.address}</span>,
                <Badge tone={statusConfig?.tone ?? "neutral"}>{statusConfig?.label ?? customer.status ?? "N/A"}</Badge>,
                customer.status !== "DELETED" ? (
                    <RowActions
                        label={fullname}
                        actions={[
                            {
                                label: "Xem chi tiết",
                                icon: <Eye className="size-4" />,
                                onClick: () => { }
                            },
                            ...(customer.status === "BLOCKED" ? [{
                                label: customerActionConfig.unblock.label,
                                icon: <UserCheck className="size-4" />,
                                onClick: () => openCustomerAction(customer._id, fullname, "unblock")
                            }] : []),
                            ...(customer.status !== "BLOCKED" ? [{
                                label: customerActionConfig.block.label,
                                icon: <Ban className="size-4" />,
                                onClick: () => openCustomerAction(customer._id, fullname, "block")
                            }] : []),
                            {
                                label: customerActionConfig.delete.label,
                                icon: <Trash className="size-4" />,
                                onClick: () => openCustomerAction(customer._id, fullname, "delete")
                            }
                        ]}
                    />
                ) : (
                    <RowActions
                        label={fullname}
                        actions={[
                            {
                                label: customerActionConfig.restoreDeleted.label,
                                icon: <RotateCcw className="size-4" />,
                                onClick: () => openCustomerAction(customer._id, fullname, "restoreDeleted")
                            }
                        ]}
                    />
                )
            ]
        }
    })

    return (
        <div className="space-y-3">
            <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Khách hàng</h2>
                <p className="text-sm text-text-secondary">
                    Khách hàng của hệ thống và quán ăn
                </p>
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b border-border-default p-4 lg:flex-row lg:items-center">
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
                            values={{
                                status: query.status ?? "all",
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
                                }
                            ]}
                            onApply={handleApplyFilter}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Khách hàng", className: "min-w-56", sortKey: "fullname", sortOrder: query.sortBy === "fullname" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Số điện thoại", className: "min-w-40" },
                        { label: "Email", className: "min-w-44" },
                        { label: "Ngày sinh", className: "min-w-32", sortKey: "birthday", sortOrder: query.sortBy === "birthday" ? query.sortOrder : null, onSort: handleSort },
                        { label: "Địa chỉ", className: "min-w-40" },
                        { label: "Trạng thái", className: "min-w-32", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: handleSort },
                        { label: "", className: "w-14" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={10}
                    emptyMessage="Không có khách hàng nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo khách hàng mới"
                    emptyIcon={PersonStanding}
                />

                {(!isLoading && pagination && customers.length > 0) && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pagination.limit}
                        onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                        onPageSizeChange={(size) => setQuery((current) => ({ ...current, limit: size, page: 1 }))}
                    />
                )}
            </section>

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${customerActionConfig[customerToAction.action].title} ${customerToAction.name || "khách hàng"}?`}
                description={customerActionConfig[customerToAction.action].description}
                confirmLabel={customerActionConfig[customerToAction.action].confirmLabel}
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
