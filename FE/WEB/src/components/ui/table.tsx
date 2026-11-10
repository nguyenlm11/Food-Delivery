import * as React from "react"
import { cn } from "cn"

const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="relative w-full overflow-x-auto overflow-y-hidden hide-scrollbar">
        <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
)

const TableHeader = ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={cn("[&_tr]:border-b", className)} {...props} />
)

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
)

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr className={cn("border-b transition-colors hover:bg-background-surface-hover", className)} {...props} />
)

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
    <th className={cn("h-10 px-3 text-left align-middle font-bold text-primary tracking-wide text-sm", className)} {...props} />
)

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("px-3 py-1.5 align-middle", className)} {...props} />
)

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
