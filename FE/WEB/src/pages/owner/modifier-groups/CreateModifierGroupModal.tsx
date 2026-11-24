import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResultDialog from "@/components/common/ResultDialog"
import { useState } from "react"
import { Plus, Settings, Trash, X } from "lucide-react"
import { useParams } from "react-router-dom"
import { createModifierGroup } from "@/services/modifier.service"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL_FORM = {
    name: "",
    minSelect: 1,
    maxSelect: 1,
    options: [{ name: "", priceAdjustment: 0 }]
}

function CreateModifierGroupModal({ open, onOpenChange }: Props) {
    const { restaurantId } = useParams()
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({ name: "", options: {} as Record<number, string> })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const showResult = (success: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess: success, message })
    }

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors({ name: "", options: {} })
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

        const nextErrors: Record<number, string> = {}
        Object.entries(errors.options).forEach(([key, value]) => {
            const errorIndex = Number(key)
            if (errorIndex < index) nextErrors[errorIndex] = value
            if (errorIndex > index) nextErrors[errorIndex - 1] = value
        })

        setErrors({ ...errors, options: nextErrors })
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        const nextErrors: Record<number, string> = {}
        const seenNames = new Set<string>()

        form.options.forEach((option, index) => {
            if (!option.name.trim()) {
                nextErrors[index] = "Vui lòng nhập tên lựa chọn"
            }

            const key = option.name.trim().toLowerCase()
            if (seenNames.has(key)) {
                nextErrors[index] = "Tên bị trùng trong danh sách"
            }
            seenNames.add(key)
        })

        const nameError = !form.name.trim() ? "Vui lòng nhập tên nhóm tùy chọn" : ""
        setErrors({ name: nameError, options: nextErrors })

        if (nameError || Object.keys(nextErrors).length > 0) return

        setIsSubmitting(true)
        try {
            await createModifierGroup(restaurantId!, {
                name: form.name.trim(),
                minSelect: Number(form.minSelect),
                maxSelect: Number(form.maxSelect),
                options: form.options.map(option => ({
                    name: option.name.trim(),
                    priceAdjustment: Number(option.priceAdjustment)
                }))
            })
            handleClear()
            showResult(true, "Đã tạo nhóm lựa chọn mới thành công.")
        }
        catch (error) {
            showResult(false, getLocalizedErrorMessage(getErrorData(error)))
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

                                    <DialogPrimitive.Close aria-label="Đóng" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
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
                                            {errors.name && <FieldError className="text-xs leading-4">{errors.name}</FieldError>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                Số lượng tối thiểu
                                                <Input
                                                    type="number"
                                                    min="0" value={form.minSelect}
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
                                            <Button type="button" disabled={form.options.length >= 10} variant="default" size="sm" onClick={handleAddOption}>
                                                <Plus className="size-3.5" />
                                                Thêm lựa chọn
                                            </Button>
                                        </div>

                                        <div className="max-h-60 space-y-2 overflow-y-auto hide-scrollbar">
                                            {form.options.map((option, index) => (
                                                <div key={index}>
                                                    <div className="flex items-center justify-between gap-2 rounded-xl border border-border-default bg-background-surface p-2">
                                                        <span className="flex size-6 items-center justify-center rounded-md bg-brand-primary-soft text-xs font-semibold tabular-nums text-brand-primary-strong">
                                                            {index + 1}
                                                        </span>

                                                        <Input
                                                            type="text"
                                                            value={option.name}
                                                            onChange={(event) => {
                                                                const options = [...form.options]
                                                                options[index] = { ...option, name: event.target.value }
                                                                setForm({ ...form, options })
                                                                setErrors({ ...errors, options: { ...errors.options, [index]: "" } })
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

                                                        <Button type="button" variant="destructive" size="icon" disabled={form.options.length === 1} onClick={() => handleRemoveOption(index)}>
                                                            <Trash className="size-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="h-4">
                                                        {errors.options[index] && <FieldError className="text-xs leading-4">{errors.options[index]}</FieldError>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-2 border-t border-border-default bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={handleClear} className="h-10 rounded-xl">
                                        Hủy
                                    </Button>
                                    <Button type="submit" loading={isSubmitting} className="h-10 rounded-xl">
                                        Tạo nhóm tùy chọn
                                    </Button>
                                </div>
                            </form>
                        </DialogPrimitive.Popup>
                    </DialogPrimitive.Viewport>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            <ResultDialog open={result.isOpen} onOpenChange={(isOpen) => setResult((current) => ({ ...current, isOpen }))} isSuccess={result.isSuccess} message={result.message} />
        </>
    )
}

export default CreateModifierGroupModal