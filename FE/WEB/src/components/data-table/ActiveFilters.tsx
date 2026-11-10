import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"

interface ActiveFiltersProps {
    filters: { key: string, label: string }[]
    onRemove: (key: string) => void
    className?: string
}

function ActiveFilters({ filters, onRemove, className }: ActiveFiltersProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const updateScrollState = useCallback(() => {
        const element = scrollRef.current
        if (!element) return

        setCanScrollLeft(element.scrollLeft > 1)
        setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1)
    }, [])

    useEffect(() => {
        updateScrollState()

        const observer = new ResizeObserver(updateScrollState)
        if (scrollRef.current) observer.observe(scrollRef.current)
        if (contentRef.current) observer.observe(contentRef.current)

        return () => observer.disconnect()
    }, [updateScrollState, filters])

    const scrollBy = (direction: 1 | -1) => {
        scrollRef.current?.scrollBy({ left: direction * 160, behavior: "smooth" })
    }

    const scrollButtonClass = "grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"

    return (
        <div className={cn("flex h-8 min-w-0 items-center gap-1", className)}>
            {canScrollLeft && (
                <button
                    type="button"
                    className={scrollButtonClass}
                    onClick={() => scrollBy(-1)}
                    aria-label="Xem bộ lọc trước"
                >
                    <ChevronLeft className="size-4" />
                </button>
            )}

            <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="hide-scrollbar min-w-0 flex-1 overflow-x-auto"
            >
                <div ref={contentRef} className="flex w-max items-center gap-2">
                    {filters.map((filter) => {
                        const [field, ...rest] = filter.label.split(":")
                        const value = rest.join(":").trim()

                        return (
                            <Badge
                                key={filter.key}
                                tone="brand"
                                className="p-3.5 max-w-56 gap-1 overflow-hidden pl-2 pr-0.5"
                            >
                                <span className="shrink-0 text-badge-brand-fg/80">{field}: </span>
                                <span className="min-w-0 truncate font-medium">{value}</span>

                                <button
                                    type="button"
                                    onClick={() => onRemove(filter.key)}
                                    className="grid size-3.5 shrink-0 place-items-center rounded-full text-badge-brand-fg/70 transition-colors hover:bg-badge-brand-fg/25 hover:text-badge-brand-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                    aria-label={`Xoá bộ lọc ${filter.label}`}
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        )
                    })}
                </div>
            </div>

            {canScrollRight && (
                <button
                    type="button"
                    className={scrollButtonClass}
                    onClick={() => scrollBy(1)}
                    aria-label="Xem bộ lọc tiếp theo"
                >
                    <ChevronRight className="size-4" />
                </button>
            )}
        </div>
    )
}

export default ActiveFilters
