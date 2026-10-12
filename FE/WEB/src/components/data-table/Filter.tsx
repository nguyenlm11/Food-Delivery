import { useState } from "react"
import { ListFilter } from "lucide-react"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
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
}

function Filter({ values, groups, onApply }: FilterProps) {
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
                    <Button type="button" variant="outline" className="shrink-0">
                        <ListFilter className="size-4" />
                        Lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </Button>
                }
            />

            <SheetContent>
                <SheetHeader className="border-b">
                    <SheetTitle>Bộ lọc</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-5 overflow-y-auto p-6">
                    {groups.map((group) => (
                        <div key={group.key} className="space-y-2">
                            <div className="text-sm font-medium">{group.label}</div>
                            <RadioGroup
                                aria-label={group.label}
                                value={draftValues[group.key] ?? group.options[0]?.value ?? ""}
                                onValueChange={(newValue) => {
                                    setDraftValues((currentValues) => ({
                                        ...currentValues,
                                        [group.key]: newValue,
                                    }))
                                }}
                                className="flex flex-row gap-5"
                            >
                                {group.options.map((option) => {
                                    const optionId = `filter-${group.key}-${option.value}`

                                    return (
                                        <div key={option.value} className="flex items-center gap-2">
                                            <RadioGroupItem id={optionId} value={option.value} />
                                            <Label htmlFor={optionId} className="cursor-pointer font-normal">
                                                {option.label}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </div>
                    ))}
                </div>

                <SheetFooter>
                    <Button type="button" variant="outline" onClick={clearFilters}>
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
