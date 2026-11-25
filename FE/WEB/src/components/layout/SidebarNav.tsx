import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { SidebarItem } from "@/utils/sidebarConfig"

interface SidebarNavProps {
    menus: SidebarItem[]
    activePath: string
    isExpanded: (path: string) => boolean
    onToggle: (item: SidebarItem) => void
    highlightId: string
    onNavigate?: () => void
}

function SidebarNav({
    menus,
    activePath,
    isExpanded,
    onToggle,
    highlightId,
    onNavigate,
}: SidebarNavProps) {
    const isItemActive = (item: SidebarItem) => {
        if (item.children?.length) {
            return item.children.some(child => child.path === activePath)
        }

        return item.path === activePath
    }

    const renderMenuItem = (item: SidebarItem): React.ReactNode => {
        const Icon = item.icon
        const hasChildren = Boolean(item.children?.length)
        const isGroupExpanded = isExpanded(item.path)
        const isActive = isItemActive(item)

        // Detect group labels (start with "group-")
        const isGroup = item.path.startsWith("group-")

        if (isGroup) {
            return (
                <div key={item.path}>
                    <div className="mt-5 mb-3 px-3 pt-2 first:mt-0">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-sidebar-muted opacity-70">
                            {item.label}
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {item.children?.map(child => renderMenuItem(child))}
                    </div>
                </div>
            )
        }

        if (hasChildren) {
            return (
                <div key={item.path}>
                    <button
                        type="button"
                        onClick={() => onToggle(item)}
                        aria-expanded={isGroupExpanded}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground transition-colors duration-200 hover:bg-sidebar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
                    >
                        <Icon size={18} className="shrink-0" />

                        <span className="min-w-0 flex-1 truncate text-left font-medium">
                            {item.label}
                        </span>

                        <span className="shrink-0">
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-300 ease-in-out ${isGroupExpanded ? "rotate-180" : ""}`}
                            />
                        </span>
                    </button>

                    <div
                        className={`grid transition-[grid-template-rows] duration-280ms ease-[cubic-bezier(0.32,0.72,0,1)] ${isGroupExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                        <div className="min-h-0 overflow-hidden">
                            <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                                {item.children?.map(child => renderMenuItem(child))}
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
                onClick={onNavigate}
                className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 focus-visible:outline-none ${isActive
                    ? "font-medium text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover"
                    }`
            }
            >
                {() => (
                    <>
                        {isActive && (
                            <motion.div
                                layoutId={`sidebar-active-highlight-${highlightId}`}
                                className="absolute inset-0 rounded-md bg-sidebar-active shadow-sm"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                        )}

                        <Icon size={18} className="relative z-10 shrink-0" />

                        <span className="relative z-10 min-w-0 truncate">
                            {item.label}
                        </span>
                    </>
                )}
            </NavLink>
        )
    }

    return <>{menus.map(item => renderMenuItem(item))}</>
}

export default SidebarNav
