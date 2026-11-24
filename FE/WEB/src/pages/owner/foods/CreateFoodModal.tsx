import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResultDialog from "@/components/common/ResultDialog"
import { useEffect, useState, type FormEvent } from "react"
import { Trash, Upload, UtensilsCrossed, X } from "lucide-react"
import { createFood } from "@/services/food.service"
import { getMenusByRestaurant } from "@/services/menu.service"
import { getRestaurantModifierGroups } from "@/services/modifier.service"
import { uploadImage } from "@/services/upload.service"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    restaurantId?: string
}

const INITIAL_FORM = {
    name: "",
    description: "",
    originalPrice: 0,
    menuId: "",
    modifierGroupIds: [] as string[]
}

function CreateFoodModal({ open, onOpenChange, restaurantId }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({ name: "", originalPrice: "", menuId: "" })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")
    const [menus, setMenus] = useState<any[]>([])
    const [modifierGroups, setModifierGroups] = useState<any[]>([])

    const availableMenus = menus.filter(menu => menu.status === "ACTIVE")
    const availableModifierGroups = modifierGroups.filter(group => group.status === "ACTIVE")

    useEffect(() => {
        if (!open || !restaurantId) { return }

        const loadOptions = async () => {
            try {
                const [menuResponse, groupResponse] = await Promise.all([
                    getMenusByRestaurant(restaurantId, { limit: 100 }),
                    getRestaurantModifierGroups(restaurantId, { limit: 100 })
                ])
                setMenus(menuResponse?.data?.menus ?? [])
                setModifierGroups(groupResponse?.data?.groups ?? [])
            }
            catch {
                setMenus([])
                setModifierGroups([])
            }
        }

        void loadOptions()
    }, [open, restaurantId])

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors({ name: "", originalPrice: "", menuId: "" })
        setImageFile(null)
        setImagePreview("")
        onOpenChange(false)
    }

    const handleToggleModifierGroup = (groupId: string) => {
        setForm((current) => ({
            ...current,
            modifierGroupIds: current.modifierGroupIds.includes(groupId)
                ? current.modifierGroupIds.filter(id => id !== groupId)
                : [...current.modifierGroupIds, groupId]
        }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const nextErrors = {
            name: form.name.trim() ? "" : "Vui lòng nhập tên món ăn",
            originalPrice: form.originalPrice > 0 ? "" : "Vui lòng nhập giá bán lớn hơn 0",
            menuId: form.menuId ? "" : "Vui lòng chọn thực đơn"
        }

        setErrors(nextErrors)
        if (nextErrors.name || nextErrors.originalPrice || nextErrors.menuId) {
            return
        }

        setIsSubmitting(true)
        try {
            const image = imageFile ? await uploadImage(imageFile) : ""

            await createFood(restaurantId!, {
                name: form.name.trim(),
                description: form.description.trim(),
                originalPrice: form.originalPrice,
                image,
                menuId: form.menuId,
                modifierGroupIds: form.modifierGroupIds
            })

            handleClear()
            setResult({ isOpen: true, isSuccess: true, message: "Món ăn đã được tạo thành công." })
        }
        catch (error) {
            setResult({
                isOpen: true,
                isSuccess: false,
                message: getLocalizedErrorMessage(getErrorData(error))
            })
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
                        <DialogPrimitive.Popup className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center gap-3 border-b border-border-default px-6 py-4">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                        <UtensilsCrossed className="size-4.5" />
                                    </span>

                                    <div className="space-y-0.5">
                                        <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                            Thêm món ăn mới
                                        </DialogPrimitive.Title>

                                        <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                            Món ăn thuộc một thực đơn và có thể kèm nhóm tùy chọn.
                                        </DialogPrimitive.Description>
                                    </div>

                                    <DialogPrimitive.Close
                                        aria-label="Đóng"
                                        className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <X className="size-4" />
                                    </DialogPrimitive.Close>
                                </div>

                                <div className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pt-4 pb-6">
                                    <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                                        <div className="space-y-1">
                                            <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                Tên món ăn
                                                <Input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={(event) => {
                                                        setForm({ ...form, name: event.target.value })
                                                        setErrors({ ...errors, name: "" })
                                                    }}
                                                    placeholder="Ví dụ: Phở bò tái..."
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
                                                Giá bán
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={form.originalPrice || ""}
                                                    onChange={(event) => {
                                                        setForm({ ...form, originalPrice: Number(event.target.value) })
                                                        setErrors({ ...errors, originalPrice: "" })
                                                    }}
                                                    placeholder="45000"
                                                    aria-invalid={Boolean(errors.originalPrice)}
                                                    className="h-10 px-3"
                                                />
                                            </Label>

                                            <div className="h-4">
                                                {errors.originalPrice && (
                                                    <FieldError className="text-xs leading-4">{errors.originalPrice}</FieldError>
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
                                        <p className="text-sm font-medium text-foreground">
                                            Thực đơn
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {availableMenus.map(menu => (
                                                <button
                                                    key={menu._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setForm({ ...form, menuId: menu._id })
                                                        setErrors({ ...errors, menuId: "" })
                                                    }}
                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${form.menuId === menu._id ? "border-brand-primary-hover bg-brand-primary-soft text-brand-primary-strong" : "border-border-default bg-background-surface text-foreground hover:border-border-strong hover:bg-background-surface-hover"}`}
                                                >
                                                    {menu.name}
                                                </button>
                                            ))}
                                        </div>

                                        {availableMenus.length === 0 && (
                                            <p className="text-xs text-muted-foreground">Chưa có thực đơn khả dụng.</p>
                                        )}

                                        <div className="h-4">
                                            {errors.menuId && (
                                                <FieldError className="text-xs leading-4">{errors.menuId}</FieldError>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground">Nhóm tùy chọn</p>

                                        <div className="flex flex-wrap gap-2">
                                            {availableModifierGroups.map(group => (
                                                <button
                                                    key={group._id}
                                                    type="button"
                                                    onClick={() => handleToggleModifierGroup(group._id)}
                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${form.modifierGroupIds.includes(group._id) ? "border-brand-primary-hover bg-brand-primary-soft text-brand-primary-strong" : "border-border-default bg-background-surface text-foreground hover:border-border-strong hover:bg-background-surface-hover"}`}
                                                >
                                                    {group.name}
                                                </button>
                                            ))}
                                        </div>

                                        {availableModifierGroups.length === 0 && (
                                            <p className="text-xs text-muted-foreground">Chưa có nhóm tùy chọn khả dụng.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground">Ảnh món ăn</p>

                                        {imagePreview ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-border-default bg-background p-3">
                                                <img src={imagePreview} alt="Ảnh món ăn" className="size-12 shrink-0 rounded-lg object-cover" />
                                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                                    {imageFile?.name}
                                                </span>

                                                <Button
                                                    type="button"
                                                    size="icon-sm"
                                                    aria-label="Xóa ảnh"
                                                    onClick={() => {
                                                        setImageFile(null)
                                                        setImagePreview("")
                                                    }}
                                                >
                                                    <Trash className="size-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-strong bg-background p-3 transition-colors hover:border-primary-hover hover:bg-brand-primary-soft">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0]
                                                        if (!file) return
                                                        setImageFile(file)
                                                        setImagePreview(URL.createObjectURL(file))
                                                    }}
                                                    className="sr-only"
                                                />

                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-strong">
                                                    <Upload className="size-4" />
                                                </span>

                                                <span className="min-w-0">
                                                    <span className="block text-xs font-medium text-foreground">Chọn ảnh</span>
                                                </span>
                                            </label>
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
                                        Thêm món ăn
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

export default CreateFoodModal
