import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { Field, FieldTitle } from "../ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange, onPageSizeChange }: PaginationProps) {
    const hasPages = totalPages > 0
    let pageNumbers: (number | "ellipsis")[]

    if (totalPages <= 7) {
        pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    else if (currentPage <= 4) {
        pageNumbers = [1, 2, 3, 4, 5, "ellipsis", totalPages]
    }
    else if (currentPage >= totalPages - 3) {
        pageNumbers = [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    else {
        pageNumbers = [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
    }

    const firstItem = (currentPage - 1) * pageSize + 1
    const lastItem = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="flex shrink-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium tabular-nums text-foreground">{firstItem}–{lastItem}</span>
                    <span> trên </span>
                    <span className="font-medium tabular-nums text-foreground">{totalItems}</span>
                    <span> kết quả</span>
                </p>

                <Field orientation="horizontal" className="w-fit">
                    <FieldTitle className="hidden sm:block">
                        Số dòng mỗi trang
                    </FieldTitle>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                            if (value) {
                                onPageSizeChange(Number(value))
                            }
                        }}
                    >
                        <SelectTrigger className="h-8 w-20 rounded-lg" aria-label="Số dòng mỗi trang">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                            <SelectGroup>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </div>

            <nav aria-label="Phân trang" className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPages || currentPage <= 1}
                    aria-label="Trang trước"
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-1">
                    {pageNumbers.map((page, index) => (
                        page === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="grid size-8 place-items-center text-sm text-muted-foreground">
                                …
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                aria-label={`Đi đến trang ${page}`}
                                aria-current={page === currentPage ? "page" : undefined}
                                className={cn(
                                    "grid size-8 place-items-center rounded-lg text-sm tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px",
                                    page === currentPage
                                        ? "bg-brand-primary font-medium text-badge-brand-fg"
                                        : "text-text-secondary hover:bg-background-surface-hover hover:text-foreground"
                                )}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasPages || currentPage >= totalPages}
                    aria-label="Trang sau"
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="size-4" aria-hidden="true" />
                </button>
            </nav>
        </div>
    )
}

export default Pagination
