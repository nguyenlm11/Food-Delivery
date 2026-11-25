import { useMemo, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { buildOwnerMenus, buildRestaurantMenus, sidebarMenus, type SidebarItem } from "@/utils/sidebarConfig"
import { extractRestaurantId } from "@/utils/restaurantPath"
import SidebarNav from "./SidebarNav"
import UserMenu from "./UserMenu"
import ResultDialog from "@/components/common/ResultDialog"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import RestaurantSwitcher from "./RestaurantSwitcher"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = user?.roleId?.name
    const restaurantId = extractRestaurantId(location.pathname)
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const menus = useMemo(() => {
        if (role !== "OWNER") {
            return sidebarMenus[role] ?? []
        }

        if (restaurantId) {
            return buildRestaurantMenus(restaurantId)
        }

        return buildOwnerMenus()
    }, [role, restaurantId])

    const allMenuItems = useMemo(() => menus.flatMap(collectItems), [menus])

    const activePath = useMemo(() => {
        let best = ""

        for (const item of allMenuItems) {
            const isMatch = location.pathname === item.path
                || location.pathname.startsWith(`${item.path}/`)

            if (isMatch && item.path.length > best.length) {
                best = item.path
            }
        }

        return best
    }, [allMenuItems, location.pathname])

    const isMenuExpanded = (path: string) => {
        if (expandedGroups[path] !== undefined) { return expandedGroups[path] }
        return true
    }

    const toggleMenu = (item: SidebarItem) => {
        setExpandedGroups((current) => ({
            ...current,
            [item.path]: !isMenuExpanded(item.path),
        }))
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logout()
            navigate("/login", { replace: true })
        }
        catch {
            setIsLoggingOut(false)
            setIsLogoutConfirmOpen(false)
            setResult((current) => ({
                ...current,
                isOpen: true,
                isSuccess: false,
                message: "Không thể đăng xuất. Vui lòng thử lại.",
            }))
        }
    }

    const userName = user?.fullname || "Người dùng"
    const avatarUrl = user?.avatar

    return (
        <div className="flex h-screen overflow-hidden bg-background-base">
            <aside className="hidden w-56 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex">
                <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                    {role === "OWNER" && restaurantId && (
                        <div className="mb-2 border-b border-sidebar-border pb-3">
                            <RestaurantSwitcher activeRestaurantId={restaurantId} />
                        </div>
                    )}

                    <SidebarNav
                        menus={menus}
                        activePath={activePath}
                        isExpanded={isMenuExpanded}
                        onToggle={toggleMenu}
                        highlightId={`${restaurantId || "root"}-desktop`}
                    />
                </nav>
            </aside>

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-default bg-background-surface px-3 sm:px-4">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    aria-label="Mở menu điều hướng"
                                >
                                    <Menu size={19} />
                                </Button>
                            }
                        />

                        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 sm:max-w-72">
                            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>

                            <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                                <SidebarNav
                                    menus={menus}
                                    activePath={activePath}
                                    isExpanded={isMenuExpanded}
                                    onToggle={toggleMenu}
                                    highlightId={`${restaurantId || "root"}-mobile`}
                                    onNavigate={() => setIsMobileMenuOpen(false)}
                                />
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/15 text-sm font-bold text-sidebar-primary">
                        F
                    </span>
                    <span className="text-base font-bold text-foreground">Foodie</span>

                    <div className="flex-1" />

                    <UserMenu
                        name={userName}
                        role={role}
                        avatarUrl={avatarUrl}
                        onLogout={() => setIsLogoutConfirmOpen(true)}
                    />
                </header>

                <main className="hide-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto bg-background-base p-2.5 sm:p-3.5 lg:p-4">
                    <Outlet />
                </main>
            </div>

            <ConfirmDialog
                open={isLogoutConfirmOpen}
                onOpenChange={setIsLogoutConfirmOpen}
                title="Đăng xuất"
                description="Bạn có chắc muốn đăng xuất khỏi hệ thống không?"
                confirmLabel="Đăng xuất"
                cancelLabel="Hủy"
                loading={isLoggingOut}
                onConfirm={() => handleLogout()}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

function collectItems(item: SidebarItem): SidebarItem[] {
    return item.children?.length ? [item, ...item.children.flatMap(collectItems)] : [item]
}

export default DashboardLayout
