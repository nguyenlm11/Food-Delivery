import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePicker from "@/components/DatePicker"
import TimePicker from "@/components/TimePicker"
import ResultDialog from "@/components/ResultDialog"
import { useState } from "react"
import { Truck, X } from "lucide-react"
import { format, parse } from "date-fns"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { createShipFee } from "@/services/ship-fee.service"
import type { CreateShipFeeParams } from "@/types/shipfee.type"

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

const INITIAL_FORM: CreateShipFeeParams = {
    ruleType: "PEAK_HOUR",
    name: "",
    multiplier: 0,
    startTime: "",
    endTime: ""
}

function CreateShipFeeModal({ open, onOpenChange }: Props) {
    const [form, setForm] = useState<CreateShipFeeParams>(INITIAL_FORM)
    const [errors, setErrors] = useState({ name: "", multiplier: "", time: "", date: "" })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const showResult = (success: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess: success, message })
    }

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors({ name: "", multiplier: "", time: "", date: "" })
        onOpenChange(false)
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        setErrors({
            name: form.name.trim() ? "" : "Vui lòng nhập tên phí",
            multiplier: form.multiplier ? "" : "Vui lòng nhập hệ số",
            time: form.ruleType === "PEAK_HOUR" && (!form.startTime || !form.endTime) ? "Vui lòng chọn khung giờ áp dụng" : "",
            date: form.ruleType === "HOLIDAY" && !form.specialDate ? "Vui lòng chọn ngày áp dụng" : ""
        })

        if (!form.name.trim() || !form.multiplier || form.ruleType === "PEAK_HOUR" && (!form.startTime || !form.endTime) || form.ruleType === "HOLIDAY" && !form.specialDate) {
            return
        }

        setIsSubmitting(true)
        try {
            await createShipFee({
                ruleType: form.ruleType,
                name: form.name.trim(),
                multiplier: form.multiplier,
                startTime: form.startTime,
                endTime: form.endTime,
                specialDate: form.specialDate
            })
            handleClear()
            showResult(true, "Phí giao hàng đã được tạo thành công.")
        }
        catch (error) {
            const response = getErrorData(error)
            showResult(false, getLocalizedErrorMessage(response))
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0" />
                    <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overflow-x-hidden p-4">
                        <DialogPrimitive.Popup className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-3 data-ending-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex flex-col">
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

                                <div className="hide-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-6 pt-4 pb-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground">Loại phí</p>

                                        <RadioGroup
                                            aria-label="Loại phí"
                                            value={form.ruleType}
                                            onValueChange={(value) => { if (value) setForm({ ...form, ruleType: value }) }}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {RULE_TYPE_OPTIONS.map((option) => {
                                                const isActive = form.ruleType === option.value

                                                return (
                                                    <label
                                                        key={option.value}
                                                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${isActive
                                                            ? "border-brand-primary-hover bg-brand-primary-soft/50"
                                                            : "border-border-default bg-background hover:border-border-strong"}`}
                                                    >
                                                        <RadioGroupItem value={option.value} />
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
                                            <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                Tên phí
                                                <Input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={(event) => {
                                                        setForm({ ...form, name: event.target.value })
                                                        setErrors({ ...errors, name: "" })
                                                    }}
                                                    placeholder="VD: Phí giao hàng giờ cao điểm..."
                                                    aria-invalid={Boolean(errors.name)}
                                                    className="h-10 px-3"
                                                />
                                            </Label>

                                            <div className="h-4">
                                                {errors.name && (
                                                    <FieldError className="text-xs leading-4">{errors.name}</FieldError>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                Hệ số nhân
                                                <div className="relative w-full">
                                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">×</span>
                                                    <Input
                                                        type="number"
                                                        min="0.1"
                                                        step="0.1"
                                                        value={form.multiplier || ""}
                                                        onChange={(event) => {
                                                            setForm({ ...form, multiplier: Number(event.target.value) })
                                                            setErrors({ ...errors, multiplier: "" })
                                                        }}
                                                        placeholder="1.5"
                                                        aria-invalid={Boolean(errors.multiplier)}
                                                        className="h-10 pr-3 pl-7"
                                                    />
                                                </div>
                                            </Label>

                                            <div className="h-4">
                                                {errors.multiplier && (
                                                    <FieldError className="text-xs leading-4">{errors.multiplier}</FieldError>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex min-h-26 flex-col gap-2">
                                        {form.ruleType === "PEAK_HOUR" && (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-sm font-medium text-foreground">Bắt đầu</p>
                                                    <TimePicker
                                                        value={form.startTime ?? ""}
                                                        onChange={(value) => {
                                                            setForm({ ...form, startTime: value })
                                                            setErrors({ ...errors, time: "" })
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <p className="text-sm font-medium text-foreground">Kết thúc</p>
                                                    <TimePicker
                                                        value={form.endTime ?? ""}
                                                        onChange={(value) => {
                                                            setForm({ ...form, endTime: value })
                                                            setErrors({ ...errors, time: "" })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {form.ruleType === "HOLIDAY" && (
                                            <div>
                                                <DatePicker
                                                    value={form.specialDate ? parse(form.specialDate, "dd-MM", new Date()) : undefined}
                                                    onChange={(date) => {
                                                        setForm({ ...form, specialDate: date ? format(date, "dd-MM") : undefined })
                                                        setErrors({ ...errors, date: "" })
                                                    }}
                                                    mode="day-month"
                                                />
                                            </div>
                                        )}

                                        <div className="h-4">
                                            {errors.time && (
                                                <FieldError className="text-xs leading-4">{errors.time}</FieldError>
                                            )}
                                            {errors.date && (
                                                <FieldError className="text-xs leading-4">{errors.date}</FieldError>
                                            )}
                                        </div>
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
            </DialogPrimitive.Root>

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(isOpen) => setResult((current) => ({ ...current, isOpen }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </>
    )
}

export default CreateShipFeeModal
