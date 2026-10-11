import { Field, FieldLabel } from "../ui/field"
import { Pagination as ShadcnPagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
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

    return (
        <div className="flex flex-col gap-4 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
                <Field orientation="horizontal" className="w-fit">
                    <FieldLabel htmlFor="select-rows-per-page">
                        Số dòng mỗi trang
                    </FieldLabel>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                            if (value) {
                                onPageSizeChange(Number(value))
                            }
                        }}
                    >
                        <SelectTrigger className="w-20" id="select-rows-per-page">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                            <SelectGroup>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                <p className="text-sm text-muted-foreground">
                    {totalItems} kết quả
                </p>
            </div>

            <ShadcnPagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            text=""
                            size="default"
                            aria-disabled={!hasPages || currentPage <= 1}
                            className={!hasPages || currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            onClick={(event) => {
                                event.preventDefault()
                                if (hasPages && currentPage > 1) {
                                    onPageChange(currentPage - 1)
                                }
                            }}
                        />
                    </PaginationItem>

                    {pageNumbers.map((page, index) => (
                        <PaginationItem key={page === "ellipsis" ? `ellipsis-${index}` : page}>
                            {page === "ellipsis" ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    size="icon"
                                    isActive={page === currentPage}
                                    aria-label={`Đi đến trang ${page}`}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        onPageChange(page)
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            text=""
                            size="default"
                            aria-disabled={!hasPages || currentPage >= totalPages}
                            className={!hasPages || currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            onClick={(event) => {
                                event.preventDefault()
                                if (hasPages && currentPage < totalPages) {
                                    onPageChange(currentPage + 1)
                                }
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </ShadcnPagination>
        </div>
    )
}

export default Pagination
