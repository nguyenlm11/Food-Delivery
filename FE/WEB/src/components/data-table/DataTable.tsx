import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowDownNarrowWide, ArrowUpNarrowWide, ChevronDown, ChevronUp } from "lucide-react"
import { useMemo } from "react"
import { cn } from "cn"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import EmptyState from "../ui/empty-state"
import { Skeleton } from "../ui/skeleton"

interface DataTableRow {
    id: string
    cells: ReactNode[]
}

interface DataTableColumn {
    label: string
    className?: string
    sortKey?: string
    sortOrder?: "asc" | "desc" | null
    onSort?: (sortKey: string) => void
}

type DataTableHeader = string | DataTableColumn

const SKELETON_ROWS = 10

interface DataTableProps {
    headers: DataTableHeader[]
    rows: DataTableRow[]
    emptyMessage?: ReactNode
    emptyDescription?: ReactNode
    emptyIcon?: LucideIcon
    emptyAction?: ReactNode
    isLoading?: boolean
}

function toColumn(header: DataTableHeader): DataTableColumn {
    return typeof header === "string" ? { label: header } : header
}

function SortableHead({ column }: { column: DataTableColumn }) {
    return (
        <button
            type="button"
            onClick={() => column.onSort?.(column.sortKey as string)}
            className="-mx-2 inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Sắp xếp theo ${column.label}`}
        >
            <span className="whitespace-nowrap">{column.label}</span>

            <span className="flex size-4 shrink-0 items-center justify-center">
                {column.sortOrder === "asc" ? (
                    <ArrowUpNarrowWide className="size-3.5" />
                ) : column.sortOrder === "desc" ? (
                    <ArrowDownNarrowWide className="size-3.5" />
                ) : (
                    null
                )}
            </span>
        </button>
    )
}

function DataTable({ headers, rows, emptyMessage, emptyDescription, emptyIcon, emptyAction, isLoading = false }: DataTableProps) {
    const columns = useMemo(() => headers.map(toColumn), [headers])
    const sortableColumns = columns.filter(column => column.sortKey && column.onSort)

    if (!isLoading && rows.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                <EmptyState
                    title={emptyMessage}
                    description={emptyDescription}
                    icon={emptyIcon}
                    action={emptyAction}
                />
            </div>
        )
    }

    return (
        <>
            <Table containerClassName="max-md:hidden" className="min-w-250 text-left">
                <TableHeader>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableHead key={index} className={column.className}>
                                {column.sortKey
                                    ? <SortableHead column={column} />
                                    : <span className="block whitespace-nowrap">{column.label}</span>}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody className="[&_tr]:h-15">
                    {isLoading
                        ? Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map((column, cellIndex) => (
                                    <TableCell key={cellIndex} className={column.className}>
                                        <Skeleton className={cn("h-4 w-full", cellIndex === 0 && "size-8 rounded-full")} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                        : rows.map((row, rowIndex) => (
                            <TableRow
                                key={row.id}
                                className="table-row-in hover:bg-background-surface-hover"
                                style={{ animationDelay: `${Math.min(rowIndex, 8) * 40}ms` }}
                            >
                                {row.cells.map((cell, index) => (
                                    <TableCell key={`${row.id}-${index}`} className={columns[index]?.className}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>

            <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto md:hidden">
                {sortableColumns.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-border-default px-4 py-3">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Sắp xếp
                        </span>

                        {sortableColumns.map(column => (
                            <button
                                key={column.sortKey}
                                type="button"
                                onClick={() => column.onSort?.(column.sortKey as string)}
                                aria-label={`Sắp xếp theo ${column.label}`}
                                className={cn(
                                    "inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    column.sortOrder
                                        ? "border-primary bg-primary-soft text-primary-strong"
                                        : "border-border-default text-text-secondary hover:bg-background-surface-hover"
                                )}
                            >
                                {column.label}

                                {column.sortOrder === "asc" && <ChevronUp size={13} className="size-3" />}
                                {column.sortOrder === "desc" && <ChevronDown size={13} className="size-3" />}
                            </button>
                        ))}
                    </div>
                )}

                <ul className="divide-y divide-border-default">
                    {isLoading
                        ? Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                            <li key={rowIndex} className="space-y-3 p-4">
                                <Skeleton className="h-5 w-2/5" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/5" />
                            </li>
                        ))
                        : rows.map(row => {
                            const [title, ...rest] = row.cells
                            const actions = rest.length > 0 ? rest[rest.length - 1] : null
                            const details = rest.slice(0, -1)

                            return (
                                <li key={row.id} className="p-4">
                                    <div className="min-w-0 text-sm font-medium wrap-break-word text-foreground">
                                        {title}
                                    </div>

                                    <dl className="mt-2.5 space-y-1.5">
                                        {details.map((cell, index) => (
                                            <div key={index} className="flex items-start justify-between gap-4">
                                                <dt className="shrink-0 text-xs tracking-wide text-muted-foreground uppercase">
                                                    {columns[index + 1]?.label}
                                                </dt>
                                                <dd className="min-w-0 text-right text-sm wrap-break-word text-text-secondary">
                                                    {cell}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {actions && (
                                        <div className="mt-3 flex justify-end">
                                            {actions}
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                </ul>
            </div>
        </>
    )
}

export default DataTable
