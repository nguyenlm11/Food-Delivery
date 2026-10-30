import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import EmptyState from "../ui/empty-state"

interface DataTableRow {
    id: string
    cells: ReactNode[]
}

interface DataTableProps {
    headers: string[]
    rows: DataTableRow[]
    emptyMessage?: ReactNode
    emptyDescription?: ReactNode
    emptyIcon?: LucideIcon
    emptyAction?: ReactNode
}

function DataTable({ headers, rows, emptyMessage, emptyDescription, emptyIcon, emptyAction }: DataTableProps) {
    if (rows.length === 0) {
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
        <Table className="min-w-155 text-left">
            <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                    {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-background-surface-hover/60">
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
