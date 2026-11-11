import { useState } from "react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { Button } from "./ui/button"

interface ConfirmDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    reasonLabel?: string
    reasonPlaceholder?: string
    loading?: boolean
    onConfirm: (reason: string) => void
}

function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Xác nhận", cancelLabel = "Hủy", reasonLabel, reasonPlaceholder, loading = false, onConfirm }: ConfirmDialogProps) {
    const [reason, setReason] = useState("")

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setReason("")
        }
        onOpenChange?.(nextOpen)
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-100 rounded-2xl p-6">
                <AlertDialogHeader className="items-center text-center">
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                {reasonLabel && (
                    <div className="mt-5 space-y-2">
                        <textarea
                            id="confirm-dialog-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder={reasonPlaceholder}
                            className="min-h-24 w-full resize-y rounded-lg border border-border-control bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                )}

                <AlertDialogFooter className="-mx-6 -mb-6 mt-5 border-t bg-muted/30 p-2 sm:flex-row sm:justify-between">
                    <AlertDialogCancel className="h-10 flex-1 rounded-xl" disabled={loading}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        className="h-10 flex-1 rounded-xl"
                        loading={loading}
                        onClick={() => onConfirm(reason.trim())}
                    >
                        {confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDialog
