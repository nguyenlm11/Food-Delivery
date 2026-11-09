import { cn } from "cn"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

interface CalendarProps {
    selected?: Date
    onSelect?: (date: Date) => void
    disablePast?: boolean
    mode?: "full" | "day-month"
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function Calendar({ selected, onSelect, disablePast = false, mode = "full" }: CalendarProps) {
    const today = new Date()

    const [internalMonth, setInternalMonth] = useState<Date>(() => selected ?? today)

    const visibleMonth = internalMonth
    const isDayMonthMode = mode === "day-month"

    const handleMonthChange = (nextMonth: Date) => {
        setInternalMonth(nextMonth)
    }

    const firstDayOfMonth = startOfMonth(visibleMonth)
    const lastDayOfMonth = endOfMonth(visibleMonth)

    const days = eachDayOfInterval({
        start: startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }),
        end: endOfWeek(lastDayOfMonth, { weekStartsOn: 1 }),
    })

    const handleSelect = (day: Date) => {
        if (!isDayMonthMode) {
            onSelect?.(day)
            return
        }

        onSelect?.(new Date(today.getFullYear(), day.getMonth(), day.getDate()))
    }

    const isDaySelected = (day: Date) => {
        if (!selected) return false
        if (isDayMonthMode) {
            return isSameMonth(day, selected) && isSameDay(day, selected)
        }
        return isSameDay(day, selected)
    }

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
                <button
                    type="button"
                    aria-label="Tháng trước"
                    onClick={() => handleMonthChange(addMonths(visibleMonth, -1))}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ChevronLeft className="size-4" />
                </button>

                <p className="text-sm font-semibold text-foreground">
                    {isDayMonthMode
                        ? capitalize(format(visibleMonth, "MMMM", { locale: vi }))
                        : capitalize(format(visibleMonth, "MMMM yyyy", { locale: vi }))}
                </p>

                <button
                    type="button"
                    aria-label="Tháng sau"
                    onClick={() => handleMonthChange(addMonths(visibleMonth, 1))}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            <div className="grid grid-cols-7">
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="flex h-7 items-center justify-center text-[0.7rem] font-medium text-muted-foreground"
                    >
                        {label}
                    </div>
                ))}

                {days.map((day) => {
                    const isSelected = isDaySelected(day)
                    const isOutside = !isSameMonth(day, visibleMonth)
                    const isDisabled = disablePast && day < startOfDay(today)

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleSelect(day)}
                            className={cn(
                                "flex h-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isSelected
                                    ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                                    : isOutside
                                        ? "text-muted-foreground/40 hover:bg-background-surface-hover"
                                        : "text-foreground hover:bg-background-surface-hover hover:text-foreground",
                                !isSelected && isToday(day) && "font-semibold text-primary-hover ring-1 ring-inset ring-primary-hover/40",
                                isDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export { Calendar }
export type { CalendarProps }
