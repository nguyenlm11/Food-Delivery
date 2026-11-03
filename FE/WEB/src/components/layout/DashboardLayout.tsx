import { useMemo, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { sidebarMenus, type SidebarItem } from "../../routes/sidebar"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet"
import Header, { type HeaderBreadcrumb } from "./Header"

const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = user?.roleId?.name
    const menus = useMemo(() => sidebarMenus[role] ?? [], [role])
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [logoutError, setLogoutError] = useState("")
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const isItemActive = (item: SidebarItem) => {
        if (item.children?.length) {
            return item.children.some(
                (child) => location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
            )
        }

        return location.pathname === item.path
    }

    const allMenuItems = useMemo(() => {
        const result: { item: SidebarItem, parent: SidebarItem | null }[] = []

        const collect = (items: SidebarItem[], parent: SidebarItem | null) => {
            for (const item of items) {
                result.push({ item, parent })

                if (item.children?.length) {
                    collect(item.children, item)
                }
            }
        }

        collect(menus, null)

        return result
    }, [menus])

    const currentMenuItem = useMemo(() => {
        const exactMatch = allMenuItems.filter(({ item }) => item.path === location.pathname)
        if (exactMatch.length > 0) {
            return exactMatch[exactMatch.length - 1]
        }

        const parentMatch = allMenuItems
            .filter(({ item }) => location.pathname.startsWith(`${item.path}/`))
            .sort((a, b) => b.item.path.length - a.item.path.length)[0]

        return parentMatch
    }, [allMenuItems, location.pathname])

    const pageTitle = currentMenuItem?.item.label ?? "Tổng quan"

    const breadcrumbs: HeaderBreadcrumb[] = []

    if (currentMenuItem) {
        const parent = currentMenuItem.parent

        if (parent) {
            breadcrumbs.push({ label: parent.label })
        }

        breadcrumbs.push({ label: currentMenuItem.item.label })
    }

    const activeParents = useMemo(
        () => menus
            .filter((item) => item.children?.some((child) =>
                location.pathname === child.path ||
                location.pathname.startsWith(`${child.path}/`),
            ))
            .map((item) => item.path),
        [menus, location.pathname],
    )

    const isMenuExpanded = (path: string) => {
        if (expandedGroups[path] !== undefined) { return expandedGroups[path] }
        return activeParents.includes(path)
    }

    const toggleMenu = (path: string) => {
        setExpandedGroups((current) => ({
            ...current,
            [path]: !isMenuExpanded(path),
        }))
    }

    const handleToggleSidebar = () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
            setIsMobileMenuOpen((current) => !current)
            return
        }

        setIsSidebarCollapsed((current) => !current)
    }

    const handleLogout = async () => {
        setLogoutError("")
        try {
            await logout()
            navigate("/login", { replace: true })
        }
        catch {
            setLogoutError("Không thể đăng xuất. Vui lòng thử lại.")
        }
    }

    const renderMenuItem = (item: SidebarItem): React.ReactNode => {
        const Icon = item.icon
        const hasChildren = Boolean(item.children?.length)
        const isExpanded = isMenuExpanded(item.path)
        const isActive = isItemActive(item)

        if (hasChildren) {
            return (
                <div key={item.path}>
                    <button
                        type="button"
                        onClick={() => toggleMenu(item.path)}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-background-surface-hover ${isActive
                            ? "font-medium text-sidebar-foreground"
                            : "text-sidebar-foreground"
                            }`}
                    >
                        <Icon size={18} className="shrink-0" />

                        <AnimatePresence initial={false}>
                            {!isSidebarCollapsed && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1, delay: 0 } }}
                                    transition={{ duration: 0.18, ease: "easeOut", delay: 0.08 }}
                                    className="min-w-0 flex-1 truncate text-left"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>

                        <AnimatePresence initial={false}>
                            {!isSidebarCollapsed && (
                                <motion.span
                                    key="chevron"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1, delay: 0 } }}
                                    transition={{ duration: 0.18, ease: "easeOut", delay: 0.08 }}
                                    className="shrink-0"
                                >
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-300 ease-in-out ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    <div
                        className={`grid transition-[grid-template-rows] duration-280ms ease-[cubic-bezier(0.32,0.72,0,1)] ${isSidebarCollapsed
                            ? "grid-rows-[0fr]"
                            : isExpanded
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]"
                            }`}
                    >
                        <div className="min-h-0 overflow-hidden">
                            <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                                {item.children?.map((child) =>
                                    renderMenuItem(child),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <NavLink
                key={item.path}
                to={item.path}
                end
                title={isSidebarCollapsed ? item.label : undefined} className={({ isActive }) => `relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none ${isActive
                    ? "font-medium text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-background-surface-hover"
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <motion.div
                                layoutId="sidebar-active-highlight"
                                className="absolute inset-0 rounded-md bg-primary-hover shadow-sm"
                                transition={{
                                    type: "spring",
                                    stiffness: 350,
                                    damping: 30,
                                }}
                            />
                        )}

                        <Icon
                            size={18}
                            className="relative z-10 shrink-0"
                        />

                        <AnimatePresence initial={false}>
                            {!isSidebarCollapsed && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1, delay: 0 } }}
                                    transition={{ duration: 0.18, ease: "easeOut", delay: 0.08 }}
                                    className="relative z-10 min-w-0 truncate"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </NavLink>
        )
    }

    return (
        <div
            className="flex h-screen overflow-hidden bg-background-base"
            style={{ "--sidebar-width": isSidebarCollapsed ? "64px" : "256px" } as React.CSSProperties}
        >
            <motion.aside
                animate={{ width: isSidebarCollapsed ? 64 : 256 }}
                initial={false}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex"
            >
                <div className="relative flex h-16 shrink-0 items-center overflow-hidden border-b border-sidebar-border px-4">
                    <span
                        className={`text-lg font-bold whitespace-nowrap text-sidebar-foreground transition-opacity duration-200 ${isSidebarCollapsed ? "pointer-events-none absolute opacity-0" : "opacity-100"}`}
                    >
                        FoodDelivery
                    </span>
                    <span
                        className={`absolute left-4 text-base font-bold text-brand-primary transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-100" : "pointer-events-none absolute opacity-0"}`}
                    >
                        F
                    </span>
                </div>

                <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
                    {menus.map((item) => renderMenuItem(item))}
                </nav>

                <div className="shrink-0 border-t border-sidebar-border p-3">
                    <button
                        type="button"
                        onClick={handleToggleSidebar}
                        aria-label={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                        title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                        className={`flex w-full items-center rounded-lg text-sm text-sidebar-foreground transition-colors hover:bg-background-surface-hover ${isSidebarCollapsed ? "justify-center py-2.5" : "gap-2 px-3 py-2.5"}`}
                    >
                        {isSidebarCollapsed ? (
                            <PanelLeftOpen size={18} className="shrink-0" />
                        ) : (
                            <>
                                <PanelLeftClose size={18} className="shrink-0" />
                                Thu gọn
                            </>
                        )}
                    </button>

                    {logoutError && (
                        <p role="alert" className="mt-2 px-1 text-xs text-destructive">
                            {logoutError}
                        </p>
                    )}
                </div>
            </motion.aside>

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    title={pageTitle}
                    breadcrumbs={breadcrumbs}
                    user={{
                        name: user?.fullname || "Người dùng",
                        role: role,
                        avatarUrl: user?.avatarUrl,
                    }}
                    onLogout={handleLogout}
                />

                <main className="hide-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto bg-background-base p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
                    <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
                    <SheetDescription className="sr-only">
                        Điều hướng chính của bảng quản trị
                    </SheetDescription>

                    <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
                        <span className="text-lg font-bold text-sidebar-foreground">FoodDelivery</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Đóng menu"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="ml-auto rounded-lg text-sidebar-foreground hover:bg-background-surface-hover"
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
                        {menus.map((item) => renderMenuItem(item))}
                    </nav>

                    <div className="shrink-0 border-t border-sidebar-border p-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-background-surface-hover"
                        >
                            <LogOut size={18} className="shrink-0" />
                            Đăng xuất
                        </button>

                        {logoutError && (
                            <p role="alert" className="mt-2 px-1 text-xs text-destructive">
                                {logoutError}
                            </p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default DashboardLayout
