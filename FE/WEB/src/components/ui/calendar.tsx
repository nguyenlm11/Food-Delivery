import { cn } from "cn"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

interface CalendarProps {
    selected?: Date
    onSelect?: (date: Date) => void
    disablePast?: boolean
    disableFuture?: boolean
    mode?: "full" | "day-month" | "day-month-year"
    /** Chế độ chọn từng trường Ngày / Tháng / Năm (dùng cho ngày sinh) */
    selectionMode?: "single" | "field"
    /** Năm nhỏ nhất có thể chọn */
    minYear?: number
    /** Năm lớn nhất có thể chọn */
    maxYear?: number
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

const MONTH_LABELS = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12"
]

const DAY_LABELS = Array.from({ length: 31 }, (_, index) => `${index + 1}`)

interface FieldOption {
    value: number
    label: string
    /** Nhãn rút gọn hiển thị trên ô chọn (nếu khác với label trong danh sách) */
    shortLabel?: string
}

interface FieldSelectProps {
    label: string
    value: number
    options: FieldOption[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onValueChange: (value: number) => void
}

function FieldSelect({ label, value, options, isOpen, onOpenChange, onValueChange }: FieldSelectProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const shouldReduceMotion = useReducedMotion()
    const selectedOption = options.find((option) => option.value === value)

    useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onOpenChange(false)
            }
        }

        document.addEventListener("mousedown", handlePointerDown)

        return () => document.removeEventListener("mousedown", handlePointerDown)
    }, [isOpen, onOpenChange])

    return (
        <div ref={containerRef} className="relative space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">{label}</span>

            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => onOpenChange(!isOpen)}
                className={cn(
                    "flex h-9 w-full items-center justify-between gap-1 whitespace-nowrap rounded-lg border border-border-control bg-background-surface px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
                    isOpen ? "border-ring ring-1 ring-ring" : "hover:border-border-strong"
                )}
            >
                <span className="min-w-0 flex-1 truncate whitespace-nowrap text-foreground">
                    {selectedOption?.shortLabel ?? selectedOption?.label ?? "—"}
                </span>

                <ChevronDown
                    className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={
                            shouldReduceMotion
                                ? { duration: 0 }
                                : { duration: 0.16, ease: [0.32, 0.72, 0, 1] }
                        }
                        className="absolute top-full left-0 z-50 mt-1.5 max-h-52 w-full min-w-max origin-top overflow-y-auto overscroll-contain rounded-xl border border-border-default bg-card p-1 shadow-lg"
                    >
                        {options.map((option) => {
                            const isActive = option.value === value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        onValueChange(option.value)
                                        onOpenChange(false)
                                    }}
                                    className={cn(
                                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors duration-150",
                                        isActive
                                            ? "bg-brand-primary-soft font-medium text-brand-primary-strong"
                                            : "text-foreground hover:bg-background-surface-hover"
                                    )}
                                >
                                    <span className="truncate whitespace-nowrap">{option.label}</span>
                                </button>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Calendar({
    selected,
    onSelect,
    disablePast = false,
    disableFuture = false,
    mode = "full",
    selectionMode = "single",
    minYear,
    maxYear
}: CalendarProps) {
    const today = new Date()

    const [internalMonth, setInternalMonth] = useState<Date>(() => selected ?? today)

    const visibleMonth = internalMonth
    const isDayMonthMode = mode === "day-month"
    const isFieldMode = selectionMode === "field"

    const currentYear = selected?.getFullYear() ?? today.getFullYear()
    const currentMonth = selected?.getMonth() ?? today.getMonth()
    const currentDay = selected?.getDate() ?? today.getDate()

    const [dayValue, setDayValue] = useState<number>(currentDay)
    const [monthValue, setMonthValue] = useState<number>(currentMonth)
    const [yearValue, setYearValue] = useState<number>(currentYear)
    const [openField, setOpenField] = useState<"day" | "month" | "year" | null>(null)

    useEffect(() => {
        if (!selected) return
        setDayValue(selected.getDate())
        setMonthValue(selected.getMonth())
        setYearValue(selected.getFullYear())
    }, [selected])

    const yearOptions = useMemo(() => {
        const upper = maxYear ?? today.getFullYear()
        const lower = minYear ?? upper - 100
        const years: number[] = []
        for (let year = upper; year >= lower; year--) {
            years.push(year)
        }
        return years
    }, [minYear, maxYear, today])

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
        if (isDayMonthMode) {
            onSelect?.(new Date(today.getFullYear(), day.getMonth(), day.getDate()))
            return
        }

        onSelect?.(day)
    }

    const isDaySelected = (day: Date) => {
        if (!selected) return false
        if (isDayMonthMode) {
            return isSameMonth(day, selected) && isSameDay(day, selected)
        }
        return isSameDay(day, selected)
    }

    const handleFieldChange = (nextDay: number, nextMonth: number, nextYear: number) => {
        const lastDayOfTargetMonth = new Date(nextYear, nextMonth + 1, 0).getDate()
        const safeDay = Math.min(nextDay, lastDayOfTargetMonth)

        setDayValue(safeDay)
        setMonthValue(nextMonth)
        setYearValue(nextYear)

        onSelect?.(new Date(nextYear, nextMonth, safeDay))
    }

    const dayOptions = useMemo<FieldOption[]>(
        () => DAY_LABELS.map((label, index) => ({ value: index + 1, label })),
        []
    )

    const monthOptions = useMemo<FieldOption[]>(
        () => MONTH_LABELS.map((label, index) => ({ value: index, label })),
        []
    )

    const yearFieldOptions = useMemo<FieldOption[]>(
        () => yearOptions.map((year) => ({ value: year, label: `${year}` })),
        [yearOptions]
    )

    if (isFieldMode) {
        return (
            <div className="w-full">
                <div className="grid grid-cols-[3.75rem_6.5rem_1fr] gap-2">
                    <FieldSelect
                        label="Ngày"
                        value={dayValue}
                        options={dayOptions}
                        isOpen={openField === "day"}
                        onOpenChange={(open) => setOpenField(open ? "day" : null)}
                        onValueChange={(value) => handleFieldChange(value, monthValue, yearValue)}
                    />

                    <FieldSelect
                        label="Tháng"
                        value={monthValue}
                        options={monthOptions}
                        isOpen={openField === "month"}
                        onOpenChange={(open) => setOpenField(open ? "month" : null)}
                        onValueChange={(value) => handleFieldChange(dayValue, value, yearValue)}
                    />

                    <FieldSelect
                        label="Năm"
                        value={yearValue}
                        options={yearFieldOptions}
                        isOpen={openField === "year"}
                        onOpenChange={(open) => setOpenField(open ? "year" : null)}
                        onValueChange={(value) => handleFieldChange(dayValue, monthValue, value)}
                    />
                </div>
            </div>
        )
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
                    const isDisabled = (disablePast && day < startOfDay(today)) || (disableFuture && day > startOfDay(today))

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
