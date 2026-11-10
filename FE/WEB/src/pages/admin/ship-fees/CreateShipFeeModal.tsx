import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePicker from "@/components/DatePicker"
import TimePicker from "@/components/TimePicker"
import { useState } from "react"
import { Truck, X } from "lucide-react"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import ResultDialog from "@/components/ResultDialog"
import { createShipFee } from "@/services/ship-fee.service"
import type { CreateShipFeeParams } from "@/types/shipfee.type"
import { format } from "date-fns"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const RULE_TYPE_OPTIONS: { value: CreateShipFeeParams["ruleType"], label: string }[] = [
    { value: "PEAK_HOUR", label: "Giờ cao điểm" },
    { value: "WEEKEND", label: "Cuối tuần" },
    { value: "HOLIDAY", label: "Ngày lễ" },
    { value: "WEATHER", label: "Thời tiết" }
]

function CreateShipFeeModal({ open, onOpenChange }: Props) {
    const [name, setName] = useState("")
    const [ruleType, setRuleType] = useState<CreateShipFeeParams["ruleType"]>("PEAK_HOUR")
    const [multiplier, setMultiplier] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [specialDate, setSpecialDate] = useState<Date>()

    const [isResultOpen, setIsResultOpen] = useState(false)
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const showResult = (success: boolean, message: string) => {
        setIsResultSuccess(success)
        setResultMessage(message)
        setIsResultOpen(true)
    }

    const handleClear = () => {
        setName("")
        setRuleType("PEAK_HOUR")
        setMultiplier("")
        setStartTime("")
        setEndTime("")
        setSpecialDate(undefined)
        onOpenChange(false)
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        if (!name) {
            showResult(false, "Vui lòng điền tên cho phí giao hàng!")
            return
        }

        if (!multiplier) {
            showResult(false, "Vui lòng điền hệ số nhân!")
            return
        }

        if (ruleType === "PEAK_HOUR" && (!startTime || !endTime)) {
            showResult(false, "Vui lòng cho biết khung thời gian áp dụng!")
            return
        }

        if (ruleType === "HOLIDAY" && !specialDate) {
            showResult(false, "Vui lòng cho biết ngày áp dụng!")
            return
        }

        setIsSubmitting(true)

        try {
            await createShipFee({
                ruleType: ruleType,
                name: name.trim(),
                multiplier: Number(multiplier),
                startTime: startTime,
                endTime: endTime,
                specialDate: specialDate ? format(specialDate, "dd-MM") : undefined,
            })
            handleClear()
            showResult(true, "Phí giao hàng đã được tạo thành công.")
        }
        catch (error) {
            const response = getErrorData(error)
            showResult(false, getLocalizedErrorMessage(response))
            onOpenChange(true)
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <DialogPrimitive.Root
                open={open}
                onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0" />

                    <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overflow-x-hidden p-4">
                        <DialogPrimitive.Popup className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-3 data-ending-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex flex-col"                        >
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <Truck className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                                Tạo phí giao hàng mới
                                            </DialogPrimitive.Title>

                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                                Phí được cộng thêm vào phí giao hàng cơ bản.
                                            </DialogPrimitive.Description>
                                        </div>
                                    </div>

                                    <DialogPrimitive.Close
                                        aria-label="Đóng"
                                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <X className="size-4" />
                                    </DialogPrimitive.Close>
                                </div>

                                <div className="space-y-4 px-6 py-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground">Loại phí</p>

                                        <RadioGroup
                                            aria-label="Loại phí"
                                            value={ruleType}
                                            onValueChange={(value) => {
                                                if (value) setRuleType(value)
                                            }}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {RULE_TYPE_OPTIONS.map((option) => {
                                                const optionId = `shipfee-rule-${option.value}`
                                                const isActive = ruleType === option.value

                                                return (
                                                    <label
                                                        key={option.value}
                                                        htmlFor={optionId}
                                                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${isActive
                                                            ? "border-brand-primary-hover bg-brand-primary-soft/50"
                                                            : "border-border-default bg-background hover:border-border-strong"}`}
                                                    >
                                                        <RadioGroupItem id={optionId} value={option.value} />

                                                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                                            {option.label}
                                                        </span>
                                                    </label>
                                                )
                                            })}
                                        </RadioGroup>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                                        <div className="space-y-2">
                                            <Label htmlFor="shipfee-name" className="text-sm font-medium text-foreground">Tên phí</Label>

                                            <Input
                                                id="shipfee-name"
                                                type="text"
                                                value={name}
                                                onChange={(event) => setName(event.target.value)}
                                                placeholder="Ví dụ: Phí giao hàng giờ cao điểm..."
                                                className="h-10 px-3"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="shipfee-multiplier" className="text-sm font-medium text-foreground">Hệ số nhân</Label>

                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                                    ×
                                                </span>

                                                <Input
                                                    id="shipfee-multiplier"
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={multiplier}
                                                    onChange={(event) => setMultiplier(event.target.value)}
                                                    placeholder="1.5"
                                                    className="h-10 pr-3 pl-7"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex min-h-26 flex-col gap-3">
                                        <p className="text-sm font-medium text-foreground">
                                            {ruleType === "PEAK_HOUR" ? "Khung giờ áp dụng" : ruleType === "HOLIDAY" ? "Ngày áp dụng" : "Thiết lập"}
                                        </p>

                                        {ruleType === "PEAK_HOUR" && (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="shipfee-start-time" className="text-sm font-medium text-foreground">Bắt đầu</Label>

                                                    <TimePicker
                                                        id="shipfee-start-time"
                                                        value={startTime}
                                                        onChange={setStartTime}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="shipfee-end-time" className="text-sm font-medium text-foreground">Kết thúc</Label>

                                                    <TimePicker
                                                        id="shipfee-end-time"
                                                        value={endTime}
                                                        onChange={setEndTime}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {ruleType === "HOLIDAY" && (
                                            <DatePicker
                                                id="shipfee-special-date"
                                                value={specialDate}
                                                onChange={setSpecialDate}
                                                placeholder="Chọn ngày"
                                                mode="day-month"
                                            />
                                        )}

                                        {ruleType === "WEEKEND" && (
                                            <p className="text-sm text-muted-foreground">
                                                Phí cuối tuần tự động áp dụng vào thứ 7 và chủ nhật.
                                            </p>
                                        )}

                                        {ruleType === "WEATHER" && (
                                            <p className="text-sm text-muted-foreground">
                                                Phí thời tiết chỉ cần hệ số nhân.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-2 border-t border-border-default bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClear}
                                        className="h-10 rounded-xl"
                                    >
                                        Hủy
                                    </Button>

                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        className="h-10 rounded-xl"
                                    >
                                        Tạo phí giao hàng
                                    </Button>
                                </div>
                            </form>
                        </DialogPrimitive.Popup>
                    </DialogPrimitive.Viewport>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root >

            <ResultDialog
                open={isResultOpen}
                onOpenChange={setIsResultOpen}
                isSuccess={isResultSuccess}
                message={resultMessage}
            />
        </>
    )
}

export default CreateShipFeeModal
