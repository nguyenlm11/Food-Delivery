import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"
import { cn } from "cn"

interface EmptyStateProps {
    title?: ReactNode
    description?: ReactNode
    icon?: LucideIcon
    className?: string
}

function EmptyState({ title, description, icon: Icon = Inbox, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-6" />
            </span>

            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>

                {description && (
                    <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
    )
}

export default EmptyState
