import type { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    description: string
    action?: ReactNode
}

export default function PageHeader({
    title,
    description,
    action,
}: PageHeaderProps) {
    return (
        <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
                <h1 className="text-title font-semibold text-foreground">
                    {title}
                </h1>
                <p className="text-sm leading-relaxed text-text-secondary">
                    {description}
                </p>
            </div>

            {action}
        </div>
    )
}
