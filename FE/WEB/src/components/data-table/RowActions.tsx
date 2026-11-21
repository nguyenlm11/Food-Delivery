import type { ReactNode } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

interface RowAction {
    label: string
    icon: ReactNode
    onClick?: () => void
}

interface RowActionsProps {
    actions: Array<RowAction | false>
}

function RowActions({ actions }: RowActionsProps) {
    const visibleActions = actions.filter((action) => action !== false)

    return (
        <div className="flex justify-center">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Thao tác"
                            className="text-text-secondary hover:text-foreground"
                        />
                    }
                >
                    <MoreVertical />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="center" side="left" className="w-44 rounded-lg border bg-popover shadow-lg">
                    {visibleActions.map(action => (
                        <DropdownMenuItem key={action.label} className="min-h-10 gap-2.5 px-2.5 py-2" onClick={action.onClick}>
                            {action.icon}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default RowActions
