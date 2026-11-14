import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResultDialog from "@/components/common/ResultDialog"
import { createCategory } from "@/services/category.service"
import { uploadImage } from "@/services/upload.service"
import { useRef, useState } from "react"
import { ImagePlus, Trash, Upload, X } from "lucide-react"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL_FORM: { name: string, iconImage: File | null } = {
    name: "",
    iconImage: null
}

function CreateCategoryModal({ open, onOpenChange }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({ name: "", iconImage: "" })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const showResult = (success: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess: success, message })
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files?.[0]
        if (!file) return
        setForm({ ...form, iconImage: file })
        setErrors({ ...errors, iconImage: "" })
    }

    const handleClearImage = () => {
        setForm({ ...form, iconImage: null })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors({ name: "", iconImage: "" })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        onOpenChange(false)
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        setErrors({
            name: form.name.trim() ? "" : "Vui lòng nhập tên danh mục",
            iconImage: form.iconImage ? "" : "Vui lòng chọn ảnh"
        })

        if (!form.name.trim() || !form.iconImage) {
            return
        }

        setIsSubmitting(true)
        try {
            const imageUrl = await uploadImage(form.iconImage)
            await createCategory({ name: form.name.trim(), iconImage: imageUrl })
            handleClear()
            showResult(true, "Danh mục đã được tạo thành công.")
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
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <ImagePlus className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                                Tạo danh mục mới
                                            </DialogPrimitive.Title>

                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                                Thêm danh mục món ăn để khách hàng có thêm lựa chọn.
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
                                            Tên danh mục
                                            <Input
                                                type="text"
                                                value={form.name}
                                                onChange={(event) => {
                                                    setForm({ ...form, name: event.target.value })
                                                    setErrors({ ...errors, name: "" })
                                                }}
                                                placeholder="Ví dụ: Pizza, Lẩu, Trà sữa..."
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
                                        <p className="text-sm font-medium text-foreground">Ảnh</p>

                                        {form.iconImage ? (
                                            <div className="flex items-center gap-4 rounded-xl border border-border-default bg-background p-3">
                                                <img src={URL.createObjectURL(form.iconImage)} className="size-12 shrink-0 rounded-lg object-cover" />
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {form.iconImage.name}
                                                    </p>
                                                </div>

                                                <Button
                                                    type="button"
                                                    aria-label="Xóa ảnh"
                                                    onClick={handleClearImage}
                                                >
                                                    <Trash className="size-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-background px-6 py-10 text-center transition-colors hover:border-primary-hover hover:bg-brand-primary-soft">
                                                <Input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="sr-only"
                                                />

                                                <span className="flex size-12 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                                    <Upload className="size-5" />
                                                </span>

                                                <span className="space-y-1">
                                                    <span className="block text-sm font-medium text-foreground">
                                                        Chọn ảnh
                                                    </span>

                                                    <span className="block text-xs text-muted-foreground">
                                                        Nhấn để chọn ảnh từ thiết bị
                                                    </span>
                                                </span>
                                            </Label>
                                        )}

                                        <div className="h-4">
                                            {errors.iconImage && (
                                                <FieldError className="text-xs leading-4">{errors.iconImage}</FieldError>
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
                                        Tạo danh mục
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

export default CreateCategoryModal
