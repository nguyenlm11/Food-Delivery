import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResultDialog from "@/components/ResultDialog"
import { createCategory } from "@/services/category.service"
import { uploadImage } from "@/services/upload.service"
import { useRef, useState } from "react"
import { ImagePlus, Trash, Upload, X } from "lucide-react"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function CreateCategoryModal({ open, onOpenChange }: Props) {
    const [name, setName] = useState("")
    const [iconImage, setIconImage] = useState<File | null>(null)
    const [isResultOpen, setIsResultOpen] = useState(false)
    const [isResultSuccess, setIsResultSuccess] = useState(true)
    const [resultMessage, setResultMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const showResult = (success: boolean, message: string) => {
        setIsResultSuccess(success)
        setResultMessage(message)
        setIsResultOpen(true)
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files?.[0]
        if (!file) return
        setIconImage(file)
    }

    const handleClearImage = () => {
        setIconImage(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleClear = () => {
        setName("")
        setIconImage(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        onOpenChange(false)
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        if (!name.trim()) {
            showResult(false, "Vui lòng điền tên cho danh mục!")
            return
        }

        if (!iconImage) {
            showResult(false, "Vui lòng chọn ảnh cho danh mục!")
            return
        }

        setIsSubmitting(true)

        try {
            const imageUrl = await uploadImage(iconImage)
            await createCategory({ name: name.trim(), iconImage: imageUrl })
            handleClear()
            showResult(true, "Danh mục đã được tạo thành công.")
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
                            <form onSubmit={handleSubmit} className="flex flex-col">
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

                                <div className="space-y-4 px-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category-name" className="text-sm font-medium text-foreground">Tên danh mục</Label>

                                        <Input
                                            id="category-name"
                                            type="text"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder="Ví dụ: Pizza, Lẩu, Trà sữa..."
                                            className="h-10 px-3"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category-icon" className="text-sm font-medium text-foreground">Ảnh</Label>

                                        <Input
                                            id="category-icon"
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="sr-only"
                                        />

                                        {iconImage ? (
                                            <div className="flex items-center gap-4 rounded-xl border border-border-default bg-background p-3">
                                                <img src={URL.createObjectURL(iconImage)} className="size-12 shrink-0 rounded-lg object-cover" />
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {iconImage.name}
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
                                            <Label
                                                htmlFor="category-icon"
                                                className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-background px-6 py-10 text-center transition-colors hover:border-primary-hover hover:bg-brand-primary-soft"
                                            >
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
                open={isResultOpen}
                onOpenChange={setIsResultOpen}
                isSuccess={isResultSuccess}
                message={resultMessage}
            />
        </>
    )
}

export default CreateCategoryModal