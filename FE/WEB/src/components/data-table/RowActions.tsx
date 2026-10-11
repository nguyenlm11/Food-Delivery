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
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" />}
                aria-label={`Thao tác với ${label}`}
            >
                <MoreHorizontal />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                {actions.map((action) => (
                    <DropdownMenuItem key={action.label} onClick={action.onClick}>
                        {action.icon}
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default RowActions
