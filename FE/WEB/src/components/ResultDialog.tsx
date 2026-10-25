import { CircleCheck, CircleX } from "lucide-react"
import { motion } from "framer-motion"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

interface ResultDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isSuccess: boolean
    message: string
}

function ResultDialog({ open, onOpenChange, isSuccess, message }: ResultDialogProps) {
    const ResultIcon = isSuccess ? CircleCheck : CircleX

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-100 rounded-2xl p-6">
                <AlertDialogHeader className="items-center text-center">
                    <motion.div
                        key={isSuccess ? "success" : "error"}
                        initial={{ scale: 0, opacity: 0, rotate: -30 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    >
                        <ResultIcon className={isSuccess ? "size-12 text-emerald-500" : "size-12 text-destructive"} />
                    </motion.div>
                    <AlertDialogTitle>
                        {isSuccess ? "Thành công" : "Thao tác thất bại"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{message}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="-mx-6 -mb-6 mt-5 border-t bg-muted/30 p-2 sm:flex-row sm:justify-between">
                    <AlertDialogAction className="h-10 w-full rounded-xl">Đóng</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ResultDialog
