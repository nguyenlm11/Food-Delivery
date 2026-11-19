import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Quản trị viên",
    OWNER: "Chủ quán",
    RESTAURANT: "Nhà hàng",
}

interface UserMenuProps {
    name?: string
    role?: string
    avatarUrl?: string
    onLogout?: () => void
    showName?: boolean
    nameClassName?: string
    triggerClassName?: string
}

function UserMenu({
    name,
    role,
    avatarUrl,
    onLogout,
    showName = true,
    nameClassName = "text-foreground",
    triggerClassName = "",
}: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const displayName = name || "Người dùng"
    const initial = displayName.charAt(0).toUpperCase()
    const roleLabel = role ? ROLE_LABELS[role] ?? role : undefined

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className={`h-9 gap-2 rounded-lg px-1.5 ${showName ? "" : "w-9 justify-center px-0"} ${triggerClassName}`}
                    />
                }
            >
                <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-badge-brand-bg text-[11px] font-semibold text-badge-brand-fg">
                    {avatarUrl
                        ? <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
                        : initial}
                </span>

                {showName && (
                    <span className={`hidden max-w-32 truncate text-sm font-medium sm:inline ${nameClassName}`}>
                        {displayName}
                    </span>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-60 p-1.5">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
                        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-badge-brand-bg text-xs font-semibold text-badge-brand-fg">
                            {avatarUrl
                                ? <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
                                : initial}
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{displayName}</span>
                            <span className="block truncate text-xs font-normal text-muted-foreground">
                                {roleLabel || "Tài khoản"}
                            </span>
                        </span>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                    variant="destructive"
                    className="gap-2.5 rounded-md px-2 py-2"
                    onClick={() => onLogout?.()}
                >
                    <LogOut size={15} />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserMenu
