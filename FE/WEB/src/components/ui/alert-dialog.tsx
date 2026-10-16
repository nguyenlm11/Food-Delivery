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
            <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
                <AlertDialogPrimitive.Popup
                    className={cn(
                        "w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg outline-none",
                        className
                    )}
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
