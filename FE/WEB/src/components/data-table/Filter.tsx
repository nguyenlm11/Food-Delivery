import { useState } from "react"
import { ChevronDown, ListFilter, SlidersHorizontal } from "lucide-react"
import { cn } from "cn"
import { Button } from "../ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"

interface FilterGroup {
    key: string
    label: string
    options: {
        label: string
        value: string
    }[]
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
    const [openGroups, setOpenGroups] = useState<string[]>(groups.map((group) => group.key))
    const [toggledGroupKey, setToggledGroupKey] = useState<string | null>(null)

    const getDefaultValues = () => Object.fromEntries(
        groups.map((group) => [group.key, group.options[0]?.value ?? ""])
    )

    const isGroupFiltered = (group: FilterGroup, source: Record<string, string>) => {
        const defaultValue = group.options[0]?.value
        return source[group.key] !== undefined && source[group.key] !== defaultValue
    }

    const activeFilterCount = groups.filter((group) => isGroupFiltered(group, values)).length

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
                if (open) {
                    setDraftValues(values)
                    setOpenGroups(groups.map((group) => group.key))
                    setToggledGroupKey(null)
                }
            }}
        >
            <SheetTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className={cn("size-9 shrink-0 px-0", className)}
                    >
                        <ListFilter className="size-4" />
                    </Button>
                }
            />

            <SheetContent className="sm:max-w-sm">
                <SheetHeader className="gap-0 border-b bg-muted/30 p-5">
                    <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-hover text-primary-foreground shadow-sm">
                            <SlidersHorizontal className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-base">Bộ lọc</SheetTitle>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {activeFilterCount > 0 ? `Đang áp dụng ${activeFilterCount} điều kiện` : "Chưa có điều kiện nào được áp dụng"}
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="hide-scrollbar flex-1 overflow-y-auto">
                    {groups.map((group) => {
                        const isGroupOpen = openGroups.includes(group.key)
                        const selectedValue = draftValues[group.key] ?? group.options[0]?.value ?? ""
                        const isFiltered = isGroupFiltered(group, values)
                        const shouldAnimateOptions = toggledGroupKey === group.key

                        return (
                            <Collapsible
                                key={group.key}
                                open={isGroupOpen}
                                onOpenChange={(open) => {
                                    setToggledGroupKey(group.key)
                                    setOpenGroups((currentKeys) => open ? [...new Set([...currentKeys, group.key])] : currentKeys.filter((item) => item !== group.key))
                                }}
                                className={cn(
                                    "border-b border-border-default transition-colors last:border-b-0",
                                    isGroupOpen && "bg-muted/20"
                                )}
                            >
                                <CollapsibleTrigger className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-background-surface-hover">
                                    <span className="text-sm font-medium text-foreground">{group.label}</span>

                                    {isFiltered && (
                                        <span className="size-1.5 shrink-0 rounded-full bg-primary-hover" aria-hidden="true" />
                                    )}

                                    <span className="flex-1" />

                                    <ChevronDown
                                        className={cn(
                                            "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-foreground",
                                            isGroupOpen && "rotate-180"
                                        )}
                                        aria-hidden="true"
                                    />
                                </CollapsibleTrigger>

                                <CollapsibleContent className="flex h-(--collapsible-panel-height) flex-col overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-starting-style:h-0 data-ending-style:h-0">
                                    <RadioGroup
                                        aria-label={group.label}
                                        value={selectedValue}
                                        onValueChange={(newValue) => {
                                            setDraftValues((currentValues) => ({
                                                ...currentValues,
                                                [group.key]: newValue,
                                            }))
                                        }}
                                        className="flex flex-col pb-3"
                                    >
                                        {group.options.map((option, optionIndex) => {
                                            const optionId = `filter-${group.key}-${option.value}`
                                            const isSelected = selectedValue === option.value

                                            return (
                                                <label
                                                    key={option.value}
                                                    htmlFor={optionId}
                                                    style={shouldAnimateOptions ? { animationDelay: `${optionIndex * 40}ms` } : undefined}
                                                    className={cn(
                                                        "flex cursor-pointer items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                                                        shouldAnimateOptions && "filter-option-in",
                                                        isSelected ? "bg-primary/8 font-medium text-foreground" : "text-text-secondary hover:bg-background-surface-hover hover:text-foreground"
                                                    )}
                                                >
                                                    <RadioGroupItem
                                                        id={optionId}
                                                        value={option.value}
                                                        className={cn(
                                                            "size-4 rounded-full border transition-colors",
                                                            isSelected ? "border-primary-hover bg-primary-hover" : "border-border-control"
                                                        )}
                                                    />

                                                    <span className="flex-1">{option.label}</span>
                                                </label>
                                            )
                                        })}
                                    </RadioGroup>
                                </CollapsibleContent>
                            </Collapsible>
                        )
                    })}
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
