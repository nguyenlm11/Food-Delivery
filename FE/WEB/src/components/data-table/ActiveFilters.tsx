import { X } from "lucide-react"
import { cn } from "cn"

interface ActiveFiltersProps {
    filters: { key: string, label: string }[]
    onRemove: (key: string) => void
    className?: string
}

function ActiveFilters({ filters, onRemove, className }: ActiveFiltersProps) {
    return (
        <div className={cn("flex h-8 shrink-0 items-center gap-2 overflow-hidden", className)}>
            {filters.map((filter) => {
                const [field, ...rest] = filter.label.split(":")
                const value = rest.join(":").trim()

                return (
                    <span
                        key={filter.key}
                        className="inline-flex h-7 min-w-0 max-w-56 shrink items-center gap-1 overflow-hidden rounded-full bg-brand-primary-soft pl-2.5 pr-0.5 text-sm text-brand-primary-strong"
                    >
                        <span className="shrink-0 text-brand-primary-strong/70">{field}: </span>
                        <span className="truncate font-medium">{value}</span>

                        <button
                            type="button"
                            onClick={() => onRemove(filter.key)}
                            className="grid size-5 shrink-0 place-items-center rounded-full text-brand-primary-strong/50 transition-colors hover:bg-brand-primary-strong/15 hover:text-brand-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            aria-label={`Xoá bộ lọc ${filter.label}`}
                        >
                            <X className="size-3.5" />
                        </button>
                    </span>
                )
            })}
        </div>
    )
}

export default ActiveFilters
