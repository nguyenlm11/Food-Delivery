import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { SidebarItem } from "@/utils/sidebarConfig"

interface SidebarNavProps {
    menus: SidebarItem[]
    activePath: string
    isExpanded: (key: string) => boolean
    onToggle: (item: SidebarItem) => void
    highlightId: string
    onNavigate?: () => void
}

export const getSidebarGroupKey = (item: SidebarItem) => `${item.path}::${item.label}`

function SidebarNav({ menus, activePath, isExpanded, onToggle, highlightId, onNavigate }: SidebarNavProps) {
    const isItemActive = (item: SidebarItem) => {
        if (item.children?.length) {
            return item.children.some(child => child.path === activePath)
        }
        return item.path === activePath
    }

    const renderMenuItem = (item: SidebarItem, index: number): React.ReactNode => {
        const Icon = item.icon
        const hasChildren = Boolean(item.children?.length)
        const groupKey = getSidebarGroupKey(item)
        const isGroupExpanded = isExpanded(groupKey)
        const isActive = isItemActive(item)
        const itemKey = `${item.path}-${item.label}-${index}`

        if (hasChildren) {
            return (
                <div key={itemKey}>
                    <button
                        type="button"
                        onClick={() => onToggle(item)}
                        aria-expanded={isGroupExpanded}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground transition-colors duration-200 hover:bg-sidebar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
                    >
                        {Icon && <Icon size={18} className="shrink-0" />}

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
                                {item.children?.map((child, childIdx) =>
                                    renderMenuItem(child, childIdx)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <NavLink
                key={itemKey}
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

                        {Icon && <Icon size={18} className="relative z-10 shrink-0" />}

                        <span className="relative z-10 min-w-0 truncate">
                            {item.label}
                        </span>
                    </>
                )}
            </NavLink>
        )
    }

    return <>{menus.map((item, idx) => renderMenuItem(item, idx))}</>
}

export default SidebarNav