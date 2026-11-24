import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ResultDialog from "@/components/common/ResultDialog"
import { useState } from "react"
import { Plus, Trash, Utensils, X } from "lucide-react"
import { useParams } from "react-router-dom"
import { createMenus } from "@/services/menu.service"
import type { CreateMenuBody } from "@/types/menu.type"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL_FORM: CreateMenuBody["menus"][number] = { name: "", description: "" }
const MAX_MENUS = 5

function CreateMenuModal({ open, onOpenChange }: Props) {
    const { restaurantId } = useParams()
    const [menus, setMenus] = useState<CreateMenuBody["menus"]>([INITIAL_FORM])
    const [errors, setErrors] = useState<Record<number, string>>({})
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const showResult = (success: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess: success, message })
    }

    const handleClear = () => {
        setMenus([INITIAL_FORM])
        setErrors({})
        onOpenChange(false)
    }

    const handleRemoveMenu = (index: number) => {
        setMenus((current) => current.filter((_, menuIndex) => menuIndex !== index))
        setErrors({})
    }

    const handleUpdateMenu = (index: number, patch: Partial<CreateMenuBody["menus"][number]>) => {
        setMenus((current) => current.map((menu, menuIndex) => (
            menuIndex === index ? { ...menu, ...patch } : menu
        )))
        setErrors((current) => ({ ...current, [index]: "" }))
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        const nextErrors: Record<number, string> = {}
        const seenNames = new Set<string>()
        let hasDuplicate = false

        menus.forEach((menu, index) => {
            const name = menu.name.trim()

            if (!name) {
                nextErrors[index] = "Vui lòng nhập tên thực đơn"
                return
            }

            const key = name.toLowerCase()
            if (seenNames.has(key)) {
                nextErrors[index] = "Tên thực đơn bị trùng trong danh sách"
                hasDuplicate = true
                return
            }

            seenNames.add(key)
        })

        setErrors(nextErrors)

        if (hasDuplicate) {
            showResult(false, "Không được trùng tên thực đơn trong cùng một lần gửi.")
            return
        }

        if (Object.keys(nextErrors).length > 0) {
            return
        }

        setIsSubmitting(true)
        try {
            await createMenus(restaurantId!, {
                menus: menus.map(menu => ({
                    name: menu.name.trim(),
                    description: menu.description?.trim() || "",
                })),
            })
            handleClear()
            showResult(true, `Đã tạo ${menus.length} thực đơn thành công.`)
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
                        <DialogPrimitive.Popup className="flex h-112 max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-3 data-ending-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <Utensils className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">Tạo thực đơn mới</DialogPrimitive.Title>
                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">Thêm nhiều thực đơn trong một lần gửi.</DialogPrimitive.Description>
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
                                    {menus.map((menu, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-[1.5rem_minmax(0,1fr)_2rem] items-start gap-2 rounded-xl border border-border-default bg-background-surface p-3"
                                        >
                                            <span className="flex size-6 items-center justify-center rounded-md bg-brand-primary-soft text-xs font-semibold tabular-nums text-brand-primary-strong">
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0 space-y-1">
                                                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                                    <Input
                                                        type="text"
                                                        value={menu.name}
                                                        onChange={(event) => handleUpdateMenu(index, { name: event.target.value })}
                                                        placeholder="Ví dụ: Món nước, Combo..."
                                                        aria-label={`Tên thực đơn ${index + 1}`}
                                                        aria-invalid={Boolean(errors[index])}
                                                        className="h-10 px-3"
                                                    />

                                                    <Input
                                                        type="text"
                                                        value={menu.description}
                                                        onChange={(event) => handleUpdateMenu(index, { description: event.target.value })}
                                                        placeholder="Mô tả (không bắt buộc)"
                                                        aria-label={`Mô tả thực đơn ${index + 1}`}
                                                        className="h-10 px-3"
                                                    />
                                                </div>

                                                <div className="h-4">
                                                    {errors[index] && (
                                                        <FieldError className="text-xs leading-4">{errors[index]}</FieldError>
                                                    )}
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Xóa thực đơn ${index + 1}`}
                                                disabled={menus.length === 1}
                                                onClick={() => handleRemoveMenu(index)}
                                                className="mt-0.5"
                                            >
                                                <Trash className="size-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        disabled={menus.length >= MAX_MENUS}
                                        onClick={() => { setMenus((current) => [...current, INITIAL_FORM]) }}
                                        className="w-full"
                                    >
                                        <Plus className="size-3.5" />Thêm thực đơn
                                    </Button>
                                </div>

                                <div className="flex flex-col-reverse gap-2 border-t border-border-default bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        {menus.length}/{MAX_MENUS} thực đơn sẽ được tạo
                                    </p>
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
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