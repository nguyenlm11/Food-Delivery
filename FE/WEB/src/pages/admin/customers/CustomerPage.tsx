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
import { getAllCustomers } from "@/services/customer.service"
import type { GetAllCustomerParams } from "@/types/customer.type"
import { userStatusConfig } from "@/utils/statusConfig"
import { PersonStanding, Trash } from "lucide-react"
import { useDialog } from "@/hooks/useDialog"
import { useTable } from "@/hooks/useTable"

function CustomerPage() {
    const [searchInput, setSearchInput] = useState("")
    const { query, updateQuery, removeFilter, changePage, changePageSize, changeSort, data, isLoading, reload } = useTable(getAllCustomers, {
        currentPage: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "",
        status: undefined
    })

    const { confirm, result, openConfirm, closeConfirm, closeResult, runAction } = useDialog()
    const [customerToDelete, setCustomerToDelete] = useState({ id: "", name: "" })

    const customers = data?.data.customers ?? []
    const pagination = data?.data.pagination

    const openDeleteConfirm = (id: string, name: string) => {
        setCustomerToDelete({ id, name })
        openConfirm()
    }

    const handleConfirmAction = async () => {
        await runAction(async () => {
            await deleteUser(customerToDelete.id)
            reload()
        }, "Khách hàng đã được xóa thành công.")
    }

    const rows = customers.map((customer: any) => {
        const status = userStatusConfig[customer.status]

        return {
            id: customer._id,
            cells: [
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        {customer.avatar && <AvatarImage src={customer.avatar} alt={customer.fullname} />}
                        <AvatarFallback name={customer.fullname}>{(customer.fullname ?? "?").trim().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="block truncate font-medium text-foreground">{customer.fullname}</span>
                </div>,
                <span className="block truncate font-medium text-foreground">{customer.email}</span>,
                <span className="block truncate font-medium text-foreground">{customer.phone}</span>,
                <Badge tone={status?.tone ?? "neutral"}>{status?.label ?? customer.status ?? "N/A"}</Badge>,
                customer.status !== "DELETED" ? (
                    <RowActions
                        label={customer.fullname ?? "khách hàng"}
                        actions={[{
                            label: "Xóa",
                            icon: <Trash className="size-4" />,
                            onClick: () => openDeleteConfirm(customer._id, customer.fullname)
                        }]}
                    />
                ) : null
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
                            ...(query.status !== undefined ? [{ key: "status", label: `Trạng thái: ${userStatusConfig[query.status]?.label}` }] : []),
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
                                updateQuery({
                                    status: values.status === "all" ? undefined : values.status.toUpperCase() as GetAllCustomerParams["status"]
                                })
                            }}
                        />
                    </div>
                </div>

                <DataTable
                    headers={[
                        { label: "Khách hàng", className: "w-[30%]", sortKey: "fullname", sortOrder: query.sortBy === "fullname" ? query.sortOrder : null, onSort: changeSort },
                        { label: "Email", className: "w-[28%]" },
                        { label: "Số điện thoại", className: "w-[15%]" },
                        { label: "Trạng thái", className: "w-[17%]", sortKey: "status", sortOrder: query.sortBy === "status" ? query.sortOrder : null, onSort: changeSort },
                        { label: "", className: "w-[10%]" }
                    ]}
                    rows={rows}
                    isLoading={isLoading}
                    skeletonRows={query.pageSize}
                    emptyMessage="Không có khách hàng nào"
                    emptyDescription="Thử tìm kiếm với từ khóa khác hoặc tạo khách hàng mới"
                    emptyIcon={PersonStanding}
                />

                {(!isLoading && pagination && customers.length > 0) && (
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
                title={`Xóa ${customerToDelete.name || "khách hàng"}?`}
                description="Tài khoản khách hàng sẽ được chuyển sang trạng thái đã xóa và không thể đăng nhập."
                confirmLabel="Xóa khách hàng"
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

export default CustomerPage
