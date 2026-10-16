import type { ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

interface RowAction {
    label: string
    icon: ReactNode
    onClick?: () => void
}

interface RowActionsProps {
    label: string
    actions: RowAction[]
}

function RowActions({ label, actions }: RowActionsProps) {
    return (
        <div className="flex justify-center">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                    aria-label={`Thao tác với ${label}`}
                >
                    <MoreHorizontal />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40 rounded-lg border bg-popover shadow-lg">
                    {actions.map((action) => (
                        <DropdownMenuItem key={action.label} className="min-h-9 gap-2 px-2.5 py-2" onClick={action.onClick}>
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
