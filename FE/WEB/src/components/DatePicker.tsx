import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "cn"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { useState } from "react"

interface DatePickerProps {
    id?: string
    value?: Date
    onChange: (date: Date | undefined) => void
    placeholder?: string
    dateFormat?: string
    className?: string
    buttonClassName?: string
    disabled?: boolean
    disablePast?: boolean
    mode?: "full" | "day-month"
}

function DatePicker({
    id,
    value,
    onChange,
    placeholder = "Chọn ngày",
    dateFormat = "dd/MM/yyyy",
    className,
    buttonClassName,
    disabled,
    disablePast = false,
    mode = "full",
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const isDayMonthMode = mode === "day-month"

    const handleSelect = (date: Date) => {
        onChange(date)
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "h-10 w-full justify-start gap-2 px-3 font-normal",
                            !value && "text-muted-foreground",
                            buttonClassName,
                            className
                        )}
                    />
                }
            >
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />

                <span className={value ? "text-foreground" : undefined}>
                    {value
                        ? format(value, isDayMonthMode ? "dd-MM" : dateFormat, { locale: vi })
                        : placeholder}
                </span>
            </PopoverTrigger>

            <PopoverContent
                sideOffset={6}
                align="start"
                className="w-78 rounded-xl border border-border-default bg-card p-3 shadow-lg"
            >
                <Calendar
                    mode={mode}
                    selected={value}
                    onSelect={handleSelect}
                    disablePast={disablePast}
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker
