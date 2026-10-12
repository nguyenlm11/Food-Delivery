import type * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { X } from "lucide-react"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

function SheetContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex justify-end">
                <DialogPrimitive.Popup
                    className={cn(
                        "relative flex h-full w-full flex-col border-l bg-background shadow-lg outline-none data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right sm:max-w-md",
                        className
                    )}
                    {...props}
                >
                    <DialogPrimitive.Close
                        aria-label="Đóng"
                        className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X className="size-4" />
                    </DialogPrimitive.Close>
                    {children}
                </DialogPrimitive.Popup>
            </DialogPrimitive.Viewport>
        </DialogPrimitive.Portal>
    )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
    return (
        <DialogPrimitive.Title
            className={cn("text-lg font-semibold text-foreground", className)}
            {...props}
        />
    )
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
    return (
        <DialogPrimitive.Description
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("mt-auto flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end", className)}
            {...props}
        />
    )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter }
