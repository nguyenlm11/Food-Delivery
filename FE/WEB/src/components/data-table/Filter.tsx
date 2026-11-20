import { useState } from "react"
import { ListFilter, RotateCcw } from "lucide-react"
import { cn } from "cn"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface FilterGroup<T> {
    key: keyof T & string
    label: string
    options: {
        label: string
        value: string
    }[]
}

interface FilterProps<T> {
    values: T
    groups: FilterGroup<T>[]
    onApply: (values: T) => void
    className?: string
}

function Filter<T extends Record<keyof T, string>>({ values, groups, onApply, className }: FilterProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [draftValues, setDraftValues] = useState<T>(values)

    const isGroupFiltered = (group: FilterGroup<T>, source: T) => {
        const defaultValue = group.options[0]?.value
        return source[group.key] !== undefined && source[group.key] !== defaultValue
    }

    const activeFilterCount = groups.filter(group => isGroupFiltered(group, values)).length

    const clearFilters = () => {
        const defaults = Object.fromEntries(
            groups.map(group => [group.key, group.options[0]?.value ?? ""])
        ) as T

        setDraftValues(defaults)
        onApply(defaults)
    }

    return (
        <Popover
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) {
                    setDraftValues(values)
                }
            }}
        >
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        aria-label={activeFilterCount > 0 ? `Bộ lọc, ${activeFilterCount} điều kiện đang áp dụng` : "Bộ lọc"}
                        className={cn(
                            "h-10 shrink-0 gap-2 rounded-xl border-border-default px-3.5 font-normal transition-colors hover:border-border-strong",
                            activeFilterCount > 0 && "border-brand-primary bg-brand-primary-soft text-brand-primary-strong hover:bg-brand-primary-soft",
                            className
                        )}
                    >
                        <ListFilter className="size-4" />
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className="grid size-5 place-items-center rounded-full bg-brand-primary text-[11px] font-semibold text-badge-brand-fg">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                }
            />

            <PopoverContent align="end" sideOffset={8} className="w-80 gap-4 rounded-2xl p-4">
                {groups.map((group) => {
                    const selectedValue = draftValues[group.key] ?? group.options[0]?.value ?? ""

                    return (
                        <div key={group.key} className="space-y-2">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</p>

                            <div className="flex flex-wrap gap-1.5">
                                {group.options.map((option) => {
                                    const isSelected = selectedValue === option.value

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() => {
                                                setDraftValues((currentValues) => ({
                                                    ...currentValues,
                                                    [group.key]: option.value,
                                                }))
                                            }}
                                            className={cn(
                                                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px",
                                                isSelected
                                                    ? "border-transparent bg-brand-primary text-badge-brand-fg"
                                                    : "border-border-default bg-background-surface text-text-secondary hover:border-border-strong hover:bg-background-surface-hover hover:text-foreground"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}

                <div className="flex items-center justify-between gap-2 border-t border-border-default pt-3">
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={clearFilters}>
                        <RotateCcw className="size-3.5" />
                        Xoá lọc
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            onApply(draftValues)
                            setIsOpen(false)
                        }}
                    >
                        Áp dụng
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default Filter
