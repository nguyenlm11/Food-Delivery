import * as React from "react"
import { cn } from "cn"

const Table = ({ className, containerClassName, ...props }: React.ComponentProps<"table"> & { containerClassName?: string }) => (
    <div className={cn("hide-scrollbar relative min-h-0 w-full flex-1 overflow-auto", containerClassName)}>
        <table className={cn("w-full border-separate border-spacing-0 caption-bottom text-sm", className)} {...props} />
    </div>
)

const TableHeader = ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={cn("[&_tr]:border-0", className)} {...props} />
)

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
    <tbody className={cn(className)} {...props} />
)

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr className={cn("transition-colors hover:bg-background-surface-hover", className)} {...props} />
)

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
    <th className={cn("table-header-bg sticky top-0 z-10 h-11 border-b border-border-default px-3 text-left align-middle font-semibold text-text-secondary text-xs tracking-wide uppercase", className)} {...props} />
)

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("border-b border-border-default px-3 py-2.5 align-middle", className)} {...props} />
)

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
