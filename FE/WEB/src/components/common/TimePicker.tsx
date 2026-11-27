import { FieldSelect } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "cn"
import { Clock } from "lucide-react"
import { useState } from "react"

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: String(i).padStart(2, "0") }))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, "0") }))

interface TimePickerProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

function TimePicker({ value, onChange, placeholder = "Chọn giờ", className }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [openField, setOpenField] = useState<"hour" | "minute" | null>(null)

    const [hour, minute] = value ? value.split(":") : []
    const parsedHour = Number(hour)
    const parsedMinute = Number(minute)
    const hourValue = Number.isInteger(parsedHour) && parsedHour >= 0 && parsedHour <= 23 ? parsedHour : new Date().getHours()
    const minuteValue = Number.isInteger(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59 ? parsedMinute : new Date().getMinutes()

    const handleFieldChange = (nextHour: number, nextMinute: number) => {
        onChange(`${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            "h-10 w-full justify-start gap-2 px-3 font-normal",
                            !value && "text-muted-foreground",
                            className
                        )}
                    />
                }
            >
                <Clock className="size-4 shrink-0 text-muted-foreground" />

                <span className={value ? "text-foreground" : undefined}>
                    {value || placeholder}
                </span>
            </PopoverTrigger>

            <PopoverContent
                sideOffset={6}
                align="start"
                className="w-64 rounded-xl border border-border-default bg-card p-3 shadow-lg"
            >
                <div className="grid grid-cols-[6.5rem_1fr] gap-2">
                    <FieldSelect
                        label="Giờ"
                        value={hourValue}
                        options={HOUR_OPTIONS}
                        isOpen={openField === "hour"}
                        onOpenChange={(open) => setOpenField(open ? "hour" : null)}
                        onValueChange={(next) => handleFieldChange(next, minuteValue)}
                    />

                    <FieldSelect
                        label="Phút"
                        value={minuteValue}
                        options={MINUTE_OPTIONS}
                        isOpen={openField === "minute"}
                        onOpenChange={(open) => setOpenField(open ? "minute" : null)}
                        onValueChange={(next) => handleFieldChange(hourValue, next)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default TimePicker
