import type * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { cn } from "cn"
import { Button } from "./button"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogClose = AlertDialogPrimitive.Close

function AlertDialogContent({ className, ...props }: AlertDialogPrimitive.Popup.Props) {
    return (
        <AlertDialogPrimitive.Portal>
            <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
            <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
                <AlertDialogPrimitive.Popup
                    className={cn("w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-[starting-style]:translate-y-3 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-3 data-[ending-style]:scale-95 data-[ending-style]:opacity-0", className)}
                    {...props}
                />
            </AlertDialogPrimitive.Viewport>
        </AlertDialogPrimitive.Portal>
    )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
    return (
        <AlertDialogPrimitive.Title
            className={cn("text-lg font-semibold", className)}
            {...props}
        />
    )
}

function AlertDialogDescription({ className, ...props }: AlertDialogPrimitive.Description.Props) {
    return (
        <AlertDialogPrimitive.Description
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function AlertDialogAction({ className, ...props }: AlertDialogPrimitive.Close.Props) {
    return (
        <AlertDialogClose
            render={<Button className={className} />}
            {...props}
        />
    )
}

function AlertDialogCancel({ className, ...props }: AlertDialogPrimitive.Close.Props) {
    return (
        <AlertDialogClose
            render={<Button variant="outline" className={className} />}
            {...props}
        />
    )
}

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
