import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react"
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

interface DataTableProps {
    headers: DataTableHeader[]
    rows: DataTableRow[]
    emptyMessage?: ReactNode
    emptyDescription?: ReactNode
    emptyIcon?: LucideIcon
    isLoading?: boolean
    skeletonRows?: number
}

function toColumn(header: DataTableHeader): DataTableColumn {
    return typeof header === "string" ? { label: header } : header
}

function SortableHead({ column }: { column: DataTableColumn }) {
    return (
        <button
            type="button"
            onClick={() => column.onSort?.(column.sortKey as string)}
            className={"-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors"}
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

function DataTable({ headers, rows, emptyMessage, emptyDescription, emptyIcon, isLoading = false, skeletonRows = 8 }: DataTableProps) {
    const columns = headers.map(toColumn)

    if (!isLoading && rows.length === 0) {
        return (
            <EmptyState
                title={emptyMessage}
                description={emptyDescription}
                icon={emptyIcon}
            />
        )
    }

    return (
        <Table className="min-w-250 text-left">
            <TableHeader className="bg-muted/50">
                <TableRow className="">
                    {columns.map((column, index) => (
                        <TableHead key={index} className={column.className}>
                            {column.sortKey
                                ? <SortableHead column={column} />
                                : <span className="block whitespace-nowrap">{column.label}</span>}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>

            <TableBody className="[&_tr]:h-12.5">
                {isLoading
                    ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
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
    )
}

export default DataTable
export type { DataTableHeader, DataTableColumn }
