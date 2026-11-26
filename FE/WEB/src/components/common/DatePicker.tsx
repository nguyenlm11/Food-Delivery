import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "cn"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { useState } from "react"

interface DatePickerProps {
    value?: Date
    onChange: (date: Date | undefined) => void
    placeholder?: string
    dateFormat?: string
    className?: string
    disabled?: boolean
    disablePast?: boolean
    disableFuture?: boolean
    mode?: "full" | "day-month" | "day-month-year"
    iconOnly?: boolean
    /** Chế độ chọn từng trường Ngày / Tháng / Năm thay vì lưới ngày */
    selectionMode?: "single" | "field"
    /** Năm nhỏ nhất có thể chọn (chỉ dùng với selectionMode="field") */
    minYear?: number
    /** Năm lớn nhất có thể chọn (chỉ dùng với selectionMode="field") */
    maxYear?: number
}

function DatePicker({
    value,
    onChange,
    placeholder = "Chọn ngày",
    dateFormat = "dd/MM/yyyy",
    className,
    disabled,
    disablePast = false,
    disableFuture = false,
    mode = "full",
    iconOnly = false,
    selectionMode = "single",
    minYear,
    maxYear
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const isDayMonthMode = mode === "day-month"
    const isDayMonthYearMode = mode === "day-month-year"

    const handleSelect = (date: Date) => {
        onChange(date)

        // Ở chế độ chọn từng trường Ngày/Tháng/Năm thì giữ popover mở để người dùng chỉnh tiếp
        if (selectionMode !== "field") {
            setIsOpen(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "h-9 justify-start gap-2 px-3 font-normal",
                            iconOnly ? "size-9 shrink-0 justify-center px-0" : "w-full",
                            !value && "text-muted-foreground",
                            className
                        )}
                    />
                }
            >
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />

                {!iconOnly && (
                    <span className={value ? "text-foreground" : undefined}>
                        {value
                            ? format(value, isDayMonthMode ? "dd-MM" : dateFormat, { locale: vi })
                            : placeholder}
                    </span>
                )}            </PopoverTrigger>

            <PopoverContent
                sideOffset={6}
                align="start"
                className={cn(
                    "rounded-xl border border-border-default bg-card p-3 shadow-lg",
                    isDayMonthYearMode ? "w-80" : "w-78",
                    selectionMode === "field" && "w-80"
                )}
            >
                <Calendar
                    mode={mode}
                    selected={value}
                    onSelect={handleSelect}
                    disablePast={disablePast}
                    disableFuture={disableFuture}
                    selectionMode={selectionMode}
                    minYear={minYear}
                    maxYear={maxYear}
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker
