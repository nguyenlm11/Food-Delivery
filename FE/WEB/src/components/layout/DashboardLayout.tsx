import { useMemo, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { buildOwnerMenus, buildRestaurantMenus, sidebarMenus, type SidebarItem } from "../../routes/sidebar"
import { extractRestaurantId } from "../../utils/restaurantPath"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet"
import Header, { type HeaderBreadcrumb } from "./Header"
import ResultDialog from "../ResultDialog"
import RestaurantSwitcher from "./RestaurantSwitcher"

const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = user?.roleId?.name
    const restaurantId = extractRestaurantId(location.pathname)
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const menus = useMemo(() => {
        if (role !== "OWNER") {
            return sidebarMenus[role] ?? []
        }

        if (restaurantId) {
            return buildRestaurantMenus(restaurantId)
        }

        return buildOwnerMenus()
    }, [role, restaurantId])

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

    const activePath = useMemo(() => {
        let best = ""

        for (const { item } of allMenuItems) {
            const isMatch = location.pathname === item.path
                || location.pathname.startsWith(`${item.path}/`)

            if (isMatch && item.path.length > best.length) {
                best = item.path
            }
        }

        return best
    }, [allMenuItems, location.pathname])

    const currentMenuItem = useMemo(() => {
        return allMenuItems.find(({ item }) => item.path === activePath) ?? null
    }, [allMenuItems, activePath])

    const isItemActive = (item: SidebarItem) => {
        if (item.children?.length) {
            return item.children.some(child => child.path === activePath)
        }

        return item.path === activePath
    }

    const pageTitle = currentMenuItem?.item.label ?? "Tổng quan"

    const breadcrumbs: HeaderBreadcrumb[] = []

    if (currentMenuItem) {
        const parent = currentMenuItem.parent

        if (parent) {
            breadcrumbs.push({ label: parent.label })
        }

        breadcrumbs.push({ label: currentMenuItem.item.label })
    }

    const isMenuExpanded = (item: SidebarItem) => {
        if (expandedGroups[item.path] !== undefined) { return expandedGroups[item.path] }
        return true
    }

    const toggleMenu = (item: SidebarItem) => {
        setExpandedGroups((current) => ({
            ...current,
            [item.path]: !isMenuExpanded(item),
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
        try {
            await logout()
            navigate("/login", { replace: true })
        }
        catch {
            setResult((current) => ({
                ...current,
                isOpen: true,
                isSuccess: false,
                message: "Không thể đăng xuất. Vui lòng thử lại.",
            }))
        }
    }

    const renderMenuItem = (item: SidebarItem): React.ReactNode => {
        const Icon = item.icon
        const hasChildren = Boolean(item.children?.length)
        const isExpanded = isMenuExpanded(item)
        const isActive = isItemActive(item)

        if (hasChildren) {
            return (
                <div key={item.path}>
                    <button
                        type="button"
                        onClick={() => toggleMenu(item)}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-sidebar-hover ${isActive
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
                title={isSidebarCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none ${isActive
                    ? "font-medium text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover"
                    }`
                }
            >
                {() => (
                    <>
                        {isActive && (
                            <motion.div
                                layoutId={`sidebar-active-highlight-${restaurantId || "root"}`}
                                className="absolute inset-0 rounded-md bg-sidebar-active shadow-sm"
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
                        className={`absolute left-4 text-base font-bold text-sidebar-primary transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-100" : "pointer-events-none absolute opacity-0"}`}
                    >
                        F
                    </span>
                </div>

                <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
                    {role === "OWNER" && restaurantId && (
                        <div className="mb-2 border-b border-sidebar-border pb-3">
                            <RestaurantSwitcher
                                activeRestaurantId={restaurantId}
                                collapsed={isSidebarCollapsed}
                            />
                        </div>
                    )}

                    {menus.map((item) => renderMenuItem(item))}
                </nav>

                <div className="shrink-0 border-t border-sidebar-border p-3">
                    <button
                        type="button"
                        onClick={handleToggleSidebar}
                        aria-label={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                        title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                        className={`flex w-full items-center rounded-lg text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-hover ${isSidebarCollapsed ? "justify-center py-2.5" : "gap-2 px-3 py-2.5"}`}
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
                </div>
            </motion.aside>

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    title={pageTitle}
                    breadcrumbs={breadcrumbs}
                    user={{
                        name: user?.fullname || "Người dùng",
                        role: role,
                        avatarUrl: user?.avatar,
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
                            className="ml-auto rounded-lg text-sidebar-foreground hover:bg-sidebar-hover"
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
                        {role === "OWNER" && restaurantId && (
                            <div className="mb-2 border-b border-sidebar-border pb-3">
                                <RestaurantSwitcher activeRestaurantId={restaurantId} />
                            </div>
                        )}

                        {menus.map((item) => renderMenuItem(item))}
                    </nav>

                    <div className="shrink-0 border-t border-sidebar-border p-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-hover"
                        >
                            <LogOut size={18} className="shrink-0" />
                            Đăng xuất
                        </button>
                    </div>
                </SheetContent>
            </Sheet>

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

export default DashboardLayout
