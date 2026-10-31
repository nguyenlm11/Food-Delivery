import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "cn"
import { Clock } from "lucide-react"
import { useState } from "react"

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

interface TimePickerProps {
    id?: string
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

function TimePicker({ id, value, onChange, placeholder = "Chọn giờ", className }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [hour, minute] = value ? value.split(":") : []

    const handleSelect = (nextHour: string, nextMinute: string) => {
        onChange(`${nextHour}:${nextMinute}`)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
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
                className="w-48 rounded-xl border border-border-default bg-card p-2 shadow-lg"
            >
                <div className="grid grid-cols-2 gap-2">
                    <div className="max-h-40 space-y-0.5 overflow-y-auto hide-scrollbar">
                        {HOURS.map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => handleSelect(h, minute)}
                                className={cn(
                                    "w-full rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-muted",
                                    h === hour ? "bg-primary font-semibold text-primary-foreground hover:bg-primary" : "text-foreground"
                                )}
                            >
                                {h}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-40 space-y-0.5 overflow-y-auto hide-scrollbar">
                        {MINUTES.map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => handleSelect(hour, m)}
                                className={cn(
                                    "w-full rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-muted",
                                    m === minute ? "bg-primary font-semibold text-primary-foreground hover:bg-primary" : "text-foreground"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default TimePicker
