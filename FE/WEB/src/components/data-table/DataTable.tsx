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
    emptyAction?: ReactNode
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
            className={"-mx-2 inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 transition-colors"}
            aria-label={`Sắp xếp theo ${column.label}`}
        >
            <span className="min-w-0 truncate">{column.label}</span>

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

function DataTable({ headers, rows, emptyMessage, emptyDescription, emptyIcon, emptyAction, isLoading = false, skeletonRows = 8 }: DataTableProps) {
    const columns = headers.map(toColumn)
    const hasFixedWidths = columns.every((column) => Boolean(column.className))

    if (!isLoading && rows.length === 0) {
        return (
            <EmptyState
                title={emptyMessage}
                description={emptyDescription}
                icon={emptyIcon}
                action={emptyAction}
            />
        )
    }

    return (
        <Table className={cn("min-w-250 text-left", hasFixedWidths && "table-fixed")}>
            <colgroup>
                {columns.map((column, index) => (
                    <col key={index} className={column.className} />
                ))}
            </colgroup>

            <TableHeader className="bg-muted/50">
                <TableRow className="">
                    {columns.map((column, index) => (
                        <TableHead key={index}>
                            {column.sortKey
                                ? <SortableHead column={column} />
                                : <span className="block truncate">{column.label}</span>}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>

            <TableBody>
                {isLoading
                    ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {columns.map((_column, cellIndex) => (
                                <TableCell key={cellIndex}>
                                    <Skeleton className={cn("h-4 w-full", cellIndex === 0 && "size-9 rounded-full")} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                    : rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-background-surface-hover">
                            {row.cells.map((cell, index) => (
                                <TableCell key={`${row.id}-${index}`}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    )
}

export default DataTable
export type { DataTableHeader, DataTableColumn }
