import { useState } from "react"
import { Bell, ChevronRight, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"

export interface HeaderBreadcrumb {
    label: string
}

interface HeaderUser {
    name: string
    role?: string
    avatarUrl?: string
}

interface HeaderProps {
    title?: string
    breadcrumbs?: HeaderBreadcrumb[]
    user?: HeaderUser
    onLogout?: () => void
}

function Header({ title, breadcrumbs = [], user, onLogout }: HeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const initial = user?.name?.charAt(0)?.toUpperCase() || "U"
    const hasBreadcrumbs = breadcrumbs.length > 0

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background-surface/95 px-4 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                {hasBreadcrumbs ? (
                    breadcrumbs.map((item, index) => {
                        const isLast = index === breadcrumbs.length - 1

                        return (
                            <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
                                {index > 0 && (
                                    <ChevronRight size={14} className="shrink-0 text-muted-foreground/40" />
                                )}

                                <span className={isLast ? "truncate font-semibold tracking-tight text-foreground" : "truncate text-muted-foreground"}
                                >
                                    {item.label}
                                </span>
                            </span>
                        )
                    })
                ) : (
                    <h1 className="truncate text-lg font-semibold tracking-tight">
                        {title}
                    </h1>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Thông báo"
                    title="Thông báo"
                    className="relative rounded-lg text-text-secondary hover:bg-background-surface-hover hover:text-foreground"
                >
                    <Bell size={19} />
                </Button>

                <div className="mx-1 h-5 w-px bg-border" />

                <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="h-9 gap-2 rounded-lg pr-2 pl-1 hover:bg-background-surface-hover"
                            />
                        }
                    >
                        <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-badge-brand-bg text-[11px] font-semibold text-badge-brand-fg">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                initial
                            )}
                        </span>

                        <span className="hidden max-w-28 truncate text-sm font-medium lg:inline">
                            {user?.name || "Người dùng"}
                        </span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        className="w-60 p-1.5"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
                                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-badge-brand-bg text-xs font-semibold text-badge-brand-fg">
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        initial
                                    )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">
                                        {user?.name || "Người dùng"}
                                    </span>
                                    <span className="block truncate text-xs font-normal text-muted-foreground">
                                        {user?.role || "Tài khoản"}
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
            </div>
        </header>
    )
}

export default Header
