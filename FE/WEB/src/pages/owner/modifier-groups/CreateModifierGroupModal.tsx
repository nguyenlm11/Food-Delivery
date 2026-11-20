import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResultDialog from "@/components/common/ResultDialog"
import { useState, type FormEvent } from "react"
import { Plus, Settings, Trash, X } from "lucide-react"
import type { ModifierGroup } from "@/types/modifier.type"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated: (group: ModifierGroup) => void
}

const INITIAL_FORM = {
    name: "",
    minSelect: 1,
    maxSelect: 1,
    options: [{ name: "", priceAdjustment: 0 }]
}

function CreateModifierGroupModal({ open, onOpenChange, onCreated }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({ name: "", options: "" })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors({ name: "", options: "" })
        onOpenChange(false)
    }

    const handleAddOption = () => {
        setForm((current) => ({
            ...current,
            options: [...current.options, { name: "", priceAdjustment: 0 }]
        }))
    }

    const handleRemoveOption = (index: number) => {
        setForm((current) => ({
            ...current,
            options: current.options.filter((_, optionIndex) => optionIndex !== index)
        }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const validOptions = form.options.filter(option => option.name.trim())
        const nextErrors = {
            name: form.name.trim() ? "" : "Vui lòng nhập tên nhóm tùy chọn",
            options: validOptions.length > 0 ? "" : "Vui lòng nhập ít nhất một lựa chọn"
        }

        setErrors(nextErrors)
        if (nextErrors.name || nextErrors.options) {
            return
        }

        setIsSubmitting(true)
        try {
            const groupId = `mg-${Date.now()}`

            onCreated({
                _id: groupId,
                name: form.name.trim(),
                minSelect: form.minSelect,
                maxSelect: form.maxSelect,
                status: "ACTIVE",
                options: validOptions.map((option, index) => ({
                    _id: `${groupId}-opt-${index}`,
                    modifierGroupId: groupId,
                    name: option.name.trim(),
                    priceAdjustment: option.priceAdjustment,
                    status: "ACTIVE"
                }))
            })
            handleClear()
            setResult({ isOpen: true, isSuccess: true, message: "Nhóm tùy chọn đã được tạo thành công." })
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
                        <DialogPrimitive.Popup className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-3 data-ending-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <Settings className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                                Tạo nhóm tùy chọn
                                            </DialogPrimitive.Title>

                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                                Khách hàng chọn trong khoảng cho phép khi gọi món.
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

                                <div className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pt-4 pb-6">
                                    <div className="space-y-1">
                                        <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                            Tên nhóm tùy chọn
                                            <Input
                                                type="text"
                                                value={form.name}
                                                onChange={(event) => {
                                                    setForm({ ...form, name: event.target.value })
                                                    setErrors({ ...errors, name: "" })
                                                }}
                                                placeholder="Ví dụ: Nước chấm, Phần ăn..."
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

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                Số lượng tối thiểu
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={form.minSelect}
                                                    onChange={(event) => setForm({ ...form, minSelect: Number(event.target.value) })}
                                                    className="h-10 px-3"
                                                />
                                            </Label>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                Số lượng tối đa
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={form.maxSelect}
                                                    onChange={(event) => setForm({ ...form, maxSelect: Number(event.target.value) })}
                                                    className="h-10 px-3"
                                                />
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium text-foreground">Lựa chọn</p>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddOption}
                                            >
                                                <Plus className="size-3.5" />Thêm lựa chọn
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {form.options.map((option, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        type="text"
                                                        value={option.name}
                                                        onChange={(event) => {
                                                            const options = [...form.options]
                                                            options[index] = { ...option, name: event.target.value }
                                                            setForm({ ...form, options })
                                                            setErrors({ ...errors, options: "" })
                                                        }}
                                                        placeholder="Tên lựa chọn"
                                                        className="h-10 min-w-0 flex-1 px-3"
                                                    />

                                                    <Input
                                                        type="number"
                                                        value={option.priceAdjustment}
                                                        onChange={(event) => {
                                                            const options = [...form.options]
                                                            options[index] = { ...option, priceAdjustment: Number(event.target.value) }
                                                            setForm({ ...form, options })
                                                        }}
                                                        placeholder="Giá"
                                                        className="h-10 w-24 shrink-0 px-3"
                                                    />

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Xóa lựa chọn"
                                                        disabled={form.options.length === 1}
                                                        onClick={() => handleRemoveOption(index)}
                                                    >
                                                        <Trash className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-4">
                                            {errors.options && (
                                                <FieldError className="text-xs leading-4">{errors.options}</FieldError>
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
                                        Tạo nhóm tùy chọn
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

export default CreateModifierGroupModal
