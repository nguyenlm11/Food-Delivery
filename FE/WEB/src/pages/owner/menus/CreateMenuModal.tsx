import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResultDialog from "@/components/common/ResultDialog"
import { useState, type FormEvent } from "react"
import { Utensils, X } from "lucide-react"
import type { Menu } from "@/types/menu.type"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated: (menu: Menu) => void
}

const INITIAL_FORM = {
    name: "",
    description: ""
}

function CreateMenuModal({ open, onOpenChange, onCreated }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({ name: "" })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors({ name: "" })
        onOpenChange(false)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.name.trim()) {
            setErrors({ name: "Vui lòng nhập tên thực đơn" })
            return
        }

        setIsSubmitting(true)
        try {
            onCreated({
                _id: `menu-${Date.now()}`,
                name: form.name.trim(),
                description: form.description.trim(),
                status: "ACTIVE"
            })
            setForm(INITIAL_FORM)
            setErrors({ name: "" })
            onOpenChange(false)
            setResult({ isOpen: true, isSuccess: true, message: "Thực đơn đã được tạo thành công." })
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
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <Utensils className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                                Tạo thực đơn mới
                                            </DialogPrimitive.Title>

                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                                Nhóm các món ăn theo chủ đề để khách dễ tìm kiếm.
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

                                <div className="hide-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pt-4 pb-6">
                                    <div className="space-y-1">
                                        <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                            Tên thực đơn
                                            <Input
                                                type="text"
                                                value={form.name}
                                                onChange={(event) => {
                                                    setForm({ ...form, name: event.target.value })
                                                    setErrors({ name: "" })
                                                }}
                                                placeholder="Ví dụ: Món nước, Combo..."
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
                                        Tạo thực đơn
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

export default CreateMenuModal
