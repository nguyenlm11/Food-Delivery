import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePicker from "@/components/DatePicker"
import TimePicker from "@/components/TimePicker"
import ResultDialog from "@/components/ResultDialog"
import { useState, type FormEvent } from "react"
import { ArrowLeft, Ticket, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { CreateVoucherParams, VoucherType, VoucherTypeDiscount } from "@/types/voucher.type"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const APPLY_OPTIONS: { value: VoucherType, label: string }[] = [
    { value: "FOOD", label: "Món ăn" },
    { value: "SHIP", label: "Phí giao hàng" }
]

const DISCOUNT_OPTIONS: { value: VoucherTypeDiscount, label: string }[] = [
    { value: "PERCENT", label: "Phần trăm" },
    { value: "AMOUNT", label: "Giá cố định" }
]

const INITIAL_FORM: CreateVoucherParams = {
    typeVoucher: "SYSTEM",
    type: "FOOD",
    typeDiscount: "PERCENT"
}

const INITIAL_ERRORS = { name: "", code: "", discountValue: "" }

function CreateVoucherModal({ open, onOpenChange }: Props) {
    const [form, setForm] = useState<CreateVoucherParams>(INITIAL_FORM)
    const [step, setStep] = useState(0)
    const [errors, setErrors] = useState(INITIAL_ERRORS)
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setStep(0)
        setErrors(INITIAL_ERRORS)
        onOpenChange(false)
    }

    const validateStep = (currentStep: number) => {
        if (currentStep === 0) {
            setErrors({
                ...INITIAL_ERRORS,
                name: form.name?.trim() ? "" : "Vui lòng nhập tên mã giảm giá",
                code: form.code?.trim() ? "" : "Vui lòng nhập mã"
            })
            return Boolean(form.name?.trim() && form.code?.trim())
        }

        if (currentStep === 1) {
            const percentOverLimit = form.typeDiscount === "PERCENT" && (form.discountValue ?? 0) > 100

            setErrors({
                ...INITIAL_ERRORS,
                discountValue: !form.discountValue ? "Vui lòng nhập chiết khấu" : form.discountValue <= 0
                    ? "Chiết khấu phải lớn hơn 0" : percentOverLimit ? "Chiết khấu không được vượt quá 100%" : ""
            })

            return !percentOverLimit && Boolean(form.discountValue && form.discountValue > 0)
        }

        return Boolean(form.startDate && form.endDate)
    }

    const handleNextStep = () => {
        if (!validateStep(step)) {
            return
        }
        setStep(step + 1)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log(form)
    }

    return (
        <>
            <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0" />
                    <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overflow-x-hidden p-4">
                        <DialogPrimitive.Popup className="flex h-112 max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-3 data-ending-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <Ticket className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                                Tạo mã giảm giá mới
                                            </DialogPrimitive.Title>

                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                                Mã của hệ thống dùng cho mọi nhà hàng trên Foodie.
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
                                    {step === 0 && (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Tên mã giảm giá
                                                        <Input
                                                            type="text"
                                                            value={form.name}
                                                            onChange={(event) => {
                                                                setForm({ ...form, name: event.target.value })
                                                                setErrors({ ...errors, name: "" })
                                                            }}
                                                            placeholder="VD: Giảm 25% đơn đầu tiên..."
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

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Mã
                                                        <Input
                                                            type="text"
                                                            value={form.code}
                                                            onChange={(event) => {
                                                                setForm({ ...form, code: event.target.value.toUpperCase() })
                                                                setErrors({ ...errors, code: "" })
                                                            }}
                                                            placeholder="FOODIE25"
                                                            aria-invalid={Boolean(errors.code)}
                                                            className="h-10 px-3 font-mono uppercase"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.code && (
                                                            <FieldError className="text-xs leading-4">{errors.code}</FieldError>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                    Mô tả
                                                    <Input
                                                        type="text"
                                                        value={form.description}
                                                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                                                        placeholder="Không bắt buộc"
                                                        className="h-10 px-3"
                                                    />
                                                </Label>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">Áp dụng cho</p>
                                                <RadioGroup
                                                    aria-label="Áp dụng cho"
                                                    value={form.type}
                                                    onValueChange={(value) => { if (value) setForm({ ...form, type: value }) }}
                                                    className="grid grid-cols-2 gap-2"
                                                >
                                                    {APPLY_OPTIONS.map((option) => {
                                                        const isActive = form.type === option.value

                                                        return (
                                                            <label
                                                                key={option.value}
                                                                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${isActive ? "border-brand-primary-hover bg-brand-primary-soft/50" : "border-border-default bg-background hover:border-border-strong"}`}
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
                                        </>
                                    )}

                                    {step === 1 && (
                                        <>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">Loại chiết khấu</p>
                                                <RadioGroup
                                                    aria-label="Loại chiết khấu"
                                                    value={form.typeDiscount}
                                                    onValueChange={(value) => { if (value) setForm({ ...form, typeDiscount: value }) }}
                                                    className="grid grid-cols-2 gap-2"
                                                >
                                                    {DISCOUNT_OPTIONS.map((option) => {
                                                        const isActive = form.typeDiscount === option.value

                                                        return (
                                                            <label
                                                                key={option.value}
                                                                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${isActive ? "border-brand-primary-hover bg-brand-primary-soft/50" : "border-border-default bg-background hover:border-border-strong"}`}
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

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Giá trị chiết khấu
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={form.discountValue || ""}
                                                            onChange={(event) => {
                                                                setForm({ ...form, discountValue: Number(event.target.value) })
                                                                setErrors({ ...errors, discountValue: "" })
                                                            }}
                                                            placeholder={form.typeDiscount === "PERCENT" ? "25" : "50000"}
                                                            aria-invalid={Boolean(errors.discountValue)}
                                                            className="h-10 pr-8 pl-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.discountValue && (
                                                            <FieldError className="text-xs leading-4">{errors.discountValue}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                {form.typeDiscount === "PERCENT" && (
                                                    <div className="space-y-1">
                                                        <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                            Mức chiết khấu tối đa
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={form.maxDiscount ?? ""}
                                                                onChange={(event) => setForm({ ...form, maxDiscount: Number(event.target.value) })}
                                                                placeholder="50000"
                                                                className="h-10 pr-8 pl-3"
                                                            />
                                                        </Label>

                                                        <div className="h-4" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Đơn tối thiểu
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={form.minPrice}
                                                            onChange={(event) => setForm({ ...form, minPrice: Number(event.target.value) })}
                                                            placeholder="0"
                                                            className="h-10 pr-8 pl-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4" />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Số lượt sử dụng tối đa
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={form.maxQuantity ?? ""}
                                                            onChange={(event) => setForm({ ...form, maxQuantity: Number(event.target.value) })}
                                                            placeholder="0"
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">Thời gian áp dụng</p>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">Bắt đầu</p>
                                                        <DatePicker
                                                            value={form.startDate ? parseISO(form.startDate) : undefined}
                                                            onChange={(date) => setForm({ ...form, startDate: date ? format(date, "yyyy-MM-dd") : "" })}
                                                            disablePast
                                                            className="h-10"
                                                        />

                                                        <div className="h-4" />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">Kết thúc</p>
                                                        <DatePicker
                                                            value={form.endDate ? parseISO(form.endDate) : undefined}
                                                            onChange={(date) => setForm({ ...form, endDate: date ? format(date, "yyyy-MM-dd") : "" })}
                                                            disablePast
                                                            className="h-10"
                                                        />

                                                        <div className="h-4" />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">Giờ bắt đầu</p>
                                                        <TimePicker
                                                            value={form.startTime ?? ""}
                                                            onChange={(value) => setForm({ ...form, startTime: value })}
                                                        />

                                                        <div className="h-4" />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">Giờ kết thúc</p>
                                                        <TimePicker
                                                            value={form.endTime ?? ""}
                                                            onChange={(value) => setForm({ ...form, endTime: value })}
                                                        />

                                                        <div className="h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-2 border-t border-border-default bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex shrink-0 items-center gap-2">
                                        {step > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setStep(step - 1)}
                                                className="h-10 rounded-xl px-3 text-muted-foreground hover:text-foreground"
                                            >
                                                <ArrowLeft className="size-4" />
                                                Quay lại
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClear}
                                            className="h-10 rounded-xl"
                                        >
                                            Hủy
                                        </Button>

                                        {step < 3 - 1 && (
                                            <Button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="h-10 rounded-xl"
                                            >
                                                Tiếp tục
                                            </Button>
                                        )}

                                        {step === 3 - 1 && (
                                            <Button
                                                type="submit"
                                                className="h-10 rounded-xl"
                                            >
                                                Tạo mã giảm giá
                                            </Button>
                                        )}
                                    </div>
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

export default CreateVoucherModal
