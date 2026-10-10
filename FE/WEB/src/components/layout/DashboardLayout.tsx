import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { sidebarMenus, type SidebarItem } from "../../routes/sidebar"
import { Button } from "../ui/button"

const DashboardLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = user?.roleId?.name
    const menus = sidebarMenus[role] ?? []
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    useEffect(() => {
        const activeParents = menus
            .filter((item) =>
                item.children?.some(
                    (child) =>
                        location.pathname === child.path ||
                        location.pathname.startsWith(`${child.path}/`),
                ),
            )
            .map((item) => item.path)

        setExpandedMenus((current) => [...new Set([...current, ...activeParents])])
    }, [location.pathname, menus])

    const toggleMenu = (path: string) => {
        setExpandedMenus((current) =>
            current.includes(path)
                ? current.filter((item) => item !== path)
                : [...current, path],
        )
    }

    const handleLogout = () => {
        logout()
        navigate("/login", { replace: true })
    }

    const isItemActive = (item: SidebarItem) => {
        if (item.children?.length) {
            return item.children.some(
                (child) =>
                    location.pathname === child.path ||
                    location.pathname.startsWith(`${child.path}/`),
            )
        }

        return location.pathname === item.path
    }

    const renderMenuItem = (item: SidebarItem): React.ReactNode => {
        const Icon = item.icon
        const hasChildren = Boolean(item.children?.length)
        const isExpanded = expandedMenus.includes(item.path)
        const isActive = isItemActive(item)

        if (hasChildren) {
            return (
                <div key={item.path}>
                    <button
                        type="button"
                        onClick={() => toggleMenu(item.path)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-muted ${isActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                            }`}
                    >
                        <Icon size={18} className="shrink-0" />

                        <span className="flex-1 text-left">
                            {item.label}
                        </span>

                        <ChevronDown
                            size={16}
                            className={`shrink-0 transition-transform duration-300 ease-in-out ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>

                    <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
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
                className={({ isActive }) => `relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${isActive
                    ? "font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <motion.div
                                layoutId="sidebar-active-highlight"
                                className="absolute inset-0 rounded-md bg-primary"
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

                        <span className="relative z-10">
                            {item.label}
                        </span>
                    </>
                )}
            </NavLink>
        )
    }

    return (
        <div className="flex min-h-screen bg-muted/30">
            <aside className="flex w-64 shrink-0 flex-col border-r bg-background">
                <div className="flex h-16 shrink-0 items-center border-b px-4">
                    <span className="text-lg font-bold">
                        FoodDelivery
                    </span>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {menus.map((item) => renderMenuItem(item))}
                </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex min-h-16 items-center justify-between gap-4 border-b bg-background px-6 py-3">
                    <div className="min-w-0">
                        <p className="truncate font-medium">{role}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.fullname}
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        <span className="ml-2">Đăng xuất</span>
                    </Button>
                </header>

                <main className="min-w-0 flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout