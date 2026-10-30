import { useState } from "react"
import { ListFilter, SlidersHorizontal } from "lucide-react"
import { cn } from "cn"
import { Button } from "../ui/button"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"

interface FilterOption {
    label: string
    value: string
}

export interface FilterGroup {
    key: string
    label: string
    options: FilterOption[]
}

interface FilterProps {
    values: Record<string, string>
    groups: FilterGroup[]
    onApply: (values: Record<string, string>) => void
    className?: string
}

function Filter({ values, groups, onApply, className }: FilterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [draftValues, setDraftValues] = useState(values)

    const getDefaultValues = () => Object.fromEntries(
        groups.map((group) => [group.key, group.options[0]?.value ?? ""])
    )

    const activeFilterCount = groups.filter((group) => {
        const defaultValue = group.options[0]?.value
        return values[group.key] !== undefined && values[group.key] !== defaultValue
    }).length

    const clearFilters = () => {
        const defaultValues = getDefaultValues()
        setDraftValues(defaultValues)
        onApply(defaultValues)
        setIsOpen(false)
    }

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) { setDraftValues(values) }
            }}
        >
            <SheetTrigger
                render={
                    <Button type="button" variant="outline" className={cn("shrink-0", className)}>
                        <ListFilter className="size-4" />
                        Lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </Button>
                }
            />

            <SheetContent className="sm:max-w-sm">
                <SheetHeader className="gap-0 border-b bg-muted/30 p-5">
                    <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-hover text-primary-foreground">
                            <SlidersHorizontal className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-base">Bộ lọc</SheetTitle>
                        </div>
                    </div>
                </SheetHeader>

                <div className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                    {groups.map((group) => (
                        <div
                            key={group.key}
                            className="rounded-xl border bg-card p-4 shadow-xs transition-colors"
                        >
                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {group.label}
                            </p>

                            <RadioGroup
                                aria-label={group.label}
                                value={draftValues[group.key] ?? group.options[0]?.value ?? ""}
                                onValueChange={(newValue) => {
                                    setDraftValues((currentValues) => ({
                                        ...currentValues,
                                        [group.key]: newValue,
                                    }))
                                }}
                                className="flex flex-col gap-2"
                            >
                                {group.options.map((option) => {
                                    const optionId = `filter-${group.key}-${option.value}`
                                    const isSelected = (draftValues[group.key] ?? group.options[0]?.value) === option.value

                                    return (
                                        <label
                                            key={option.value}
                                            htmlFor={optionId}
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-transparent hover:bg-muted/60"
                                                }`}
                                        >
                                            <RadioGroupItem id={optionId} value={option.value} />
                                            <span className="flex-1 text-sm font-medium">
                                                {option.label}
                                            </span>
                                        </label>
                                    )
                                })}
                            </RadioGroup>
                        </div>
                    ))}
                </div>

                <SheetFooter className="flex-row items-center justify-between gap-2 bg-muted/30 p-4">
                    <Button type="button" variant="ghost" className="text-muted-foreground" onClick={clearFilters}>
                        Xóa bộ lọc
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onApply(draftValues)
                            setIsOpen(false)
                        }}
                    >
                        Áp dụng
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default Filter