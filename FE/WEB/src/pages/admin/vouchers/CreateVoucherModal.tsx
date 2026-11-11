import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePicker from "@/components/DatePicker"
import TimePicker from "@/components/TimePicker"
import ResultDialog from "@/components/ResultDialog"
import { useState } from "react"
import { Ticket, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { CreateVoucherParams, VoucherType, VoucherTypeDiscount } from "@/types/voucher.type"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const STEP_LABELS = ["Mã khuyến mãi", "Chiết khấu", "Thời gian"]

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

function CreateVoucherModal({ open, onOpenChange }: Props) {
    const [form, setForm] = useState<CreateVoucherParams>(INITIAL_FORM)
    const [step, setStep] = useState(0)
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    // const showResult = (success: boolean, message: string) => {
    //     setResult({ isOpen: true, isSuccess: success, message })
    // }

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setStep(0)
        onOpenChange(false)
    }

    const handleSubmit = (event: any) => {
        event.preventDefault()
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
                                                Tạo mã khuyến mãi mới
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

                                <ol className="grid grid-cols-3 gap-3 border-b border-border-default px-6 py-3">
                                    {STEP_LABELS.map((label, index) => (
                                        <li key={label} className="flex items-center gap-2">
                                            <span className={`truncate text-xs ${index === step ? "font-extrabold text-foreground" : "text-muted-foreground"}`}>
                                                {label}
                                            </span>
                                        </li>
                                    ))}
                                </ol>

                                <div className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
                                    {step === 0 && (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                                                <div className="space-y-2">
                                                    <Label htmlFor="voucher-name" className="text-sm font-medium text-foreground">Tên khuyến mãi</Label>
                                                    <Input
                                                        id="voucher-name"
                                                        type="text"
                                                        value={form.name}
                                                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                                                        placeholder="VD: Giảm 25% đơn đầu tiên..."
                                                        className="h-10 px-3"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="voucher-code" className="text-sm font-medium text-foreground">Mã</Label>
                                                    <Input
                                                        id="voucher-code"
                                                        type="text"
                                                        value={form.code}
                                                        onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                                                        placeholder="FOODIE25"
                                                        className="h-10 px-3 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="voucher-description" className="text-sm font-medium text-foreground">Mô tả</Label>
                                                <Input
                                                    id="voucher-description"
                                                    type="text"
                                                    value={form.description}
                                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                                    placeholder="Không bắt buộc"
                                                    className="h-10 px-3"
                                                />
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
                                                        const optionId = `voucher-type-${option.value}`
                                                        const isActive = form.type === option.value

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
                                                        const optionId = `voucher-discount-${option.value}`
                                                        const isActive = form.typeDiscount === option.value

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

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="voucher-discount-value" className="text-sm font-medium text-foreground">Giá trị chiết khấu</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="voucher-discount-value"
                                                            type="number"
                                                            min="0"
                                                            value={form.discountValue || ""}
                                                            onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })}
                                                            placeholder={form.typeDiscount === "PERCENT" ? "25" : "50000"}
                                                            className="h-10 pr-8 pl-3"
                                                        />
                                                    </div>
                                                </div>

                                                {form.typeDiscount === "PERCENT" ? (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="voucher-max-discount" className="text-sm font-medium text-foreground">Mức chiết khấu tối đa</Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="voucher-max-discount"
                                                                type="number"
                                                                min="0"
                                                                value={form.maxDiscount ?? ""}
                                                                onChange={(event) => setForm({ ...form, maxDiscount: event.target.value ? Number(event.target.value) : null })}
                                                                placeholder="50000"
                                                                className="h-10 pr-8 pl-3"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="voucher-min-price" className="text-sm font-medium text-foreground">Đơn tối thiểu</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="voucher-min-price"
                                                            type="number"
                                                            min="0"
                                                            value={form.minPrice || ""}
                                                            onChange={(event) => setForm({ ...form, minPrice: Number(event.target.value) })}
                                                            placeholder="0"
                                                            className="h-10 pr-8 pl-3"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="voucher-max-quantity" className="text-sm font-medium text-foreground">Số lượt sử dụng tối đa</Label>
                                                    <Input
                                                        id="voucher-max-quantity"
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={form.maxQuantity ?? ""}
                                                        onChange={(event) => setForm({ ...form, maxQuantity: event.target.value ? Number(event.target.value) : null })}
                                                        placeholder="0"
                                                        className="h-10 px-3"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">Thời gian áp dụng</p>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="voucher-start-date" className="text-sm font-medium text-foreground">Bắt đầu</Label>
                                                        <DatePicker
                                                            id="voucher-start-date"
                                                            value={form.startDate ? parseISO(form.startDate) : undefined}
                                                            onChange={(date) => setForm({ ...form, startDate: date ? format(date, "yyyy-MM-dd") : "" })}
                                                            disablePast
                                                            className="h-10"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="voucher-end-date" className="text-sm font-medium text-foreground">Kết thúc</Label>
                                                        <DatePicker
                                                            id="voucher-end-date"
                                                            value={form.endDate ? parseISO(form.endDate) : undefined}
                                                            onChange={(date) => setForm({ ...form, endDate: date ? format(date, "yyyy-MM-dd") : "" })}
                                                            disablePast
                                                            className="h-10"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="voucher-start-time" className="text-sm font-medium text-foreground">Giờ bắt đầu</Label>
                                                        <TimePicker
                                                            id="voucher-start-time"
                                                            value={form.startTime ?? ""}
                                                            onChange={(value) => setForm({ ...form, startTime: value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="voucher-end-time" className="text-sm font-medium text-foreground">Giờ kết thúc</Label>

                                                        <TimePicker
                                                            id="voucher-end-time"
                                                            value={form.endTime ?? ""}
                                                            onChange={(value) => setForm({ ...form, endTime: value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
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

                                    {step > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep(step - 1)}
                                            className="h-10 rounded-xl"
                                        >
                                            Quay lại
                                        </Button>
                                    )}

                                    {step < STEP_LABELS.length - 1 ? (
                                        <Button
                                            type="button"
                                            onClick={() => setStep(step + 1)}
                                            className="h-10 rounded-xl"
                                        >
                                            Tiếp tục
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="h-10 rounded-xl"
                                        >
                                            Tạo mã khuyến mãi
                                        </Button>
                                    )}
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
