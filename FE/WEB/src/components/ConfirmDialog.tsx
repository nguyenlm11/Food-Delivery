import { useState, type ReactElement } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"

interface ConfirmDialogProps {
    trigger?: ReactElement
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    reasonLabel?: string
    reasonPlaceholder?: string
    onConfirm: (reason: string) => void
    onCancel?: () => void
}

function ConfirmDialog({ trigger, open, onOpenChange, title, description, confirmLabel = "Xác nhận", cancelLabel = "Hủy", reasonLabel, reasonPlaceholder = "Nhập lý do...", onConfirm, onCancel }: ConfirmDialogProps) {
    const [reason, setReason] = useState("")

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <AlertDialogTrigger render={trigger} />}
            <AlertDialogContent className="max-w-100 rounded-2xl p-6">
                <AlertDialogHeader className="items-center text-center">
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                {reasonLabel && (
                    <div className="mt-5 space-y-2">
                        <label htmlFor="confirm-dialog-reason" className="text-sm font-medium">
                            {reasonLabel}
                        </label>
                        <textarea
                            id="confirm-dialog-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder={reasonPlaceholder}
                            className="min-h-24 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                    </div>
                )}
                
                <AlertDialogFooter className="-mx-6 -mb-6 mt-5 border-t bg-muted/30 p-2 sm:flex-row sm:justify-between">
                    <AlertDialogCancel className="h-10 flex-1 rounded-xl" onClick={onCancel}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction className="h-10 flex-1 rounded-xl" onClick={() => onConfirm(reason.trim())}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDialog
