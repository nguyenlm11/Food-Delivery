import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface DataTableRow {
    id: string
    cells: ReactNode[]
}

interface DataTableProps {
    headers: string[]
    rows: DataTableRow[]
    isLoading?: boolean
    emptyMessage?: string
}

function DataTable({ headers, rows, isLoading = false, emptyMessage = "Không có dữ liệu." }: DataTableProps) {
    if (isLoading) {
        return <div className="p-10 text-center text-sm text-muted-foreground">Đang tải dữ liệu…</div>
    }

    if (rows.length === 0) {
        return <div className="p-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>
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
