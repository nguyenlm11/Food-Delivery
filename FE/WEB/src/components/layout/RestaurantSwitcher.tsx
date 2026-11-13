import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronsUpDown, Store } from "lucide-react"
import { getMyRestaurants } from "@/services/restaurant.service"
import { buildOwnerResourcePath, extractOwnerResourceSegment } from "@/utils/restaurantPath"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"

interface RestaurantSwitcherProps {
    activeRestaurantId: string
    collapsed?: boolean
}

function RestaurantSwitcher({ activeRestaurantId, collapsed = false }: RestaurantSwitcherProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getMyRestaurants()
                setData(response)
            }
            catch {
                setData(null)
            }
            finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const restaurants = data?.data ?? []
    const activeRestaurant = restaurants.find((item: any) => item._id === activeRestaurantId)
    const currentSegment = extractOwnerResourceSegment(location.pathname)

    const handleSelect = (restaurantId: string) => {
        const segment = currentSegment || "overview"
        navigate(buildOwnerResourcePath(restaurantId, segment))
    }

    if (!isLoading && restaurants.length === 0) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <button
                        type="button"
                        title={collapsed ? (activeRestaurant?.name ?? "Chọn nhà hàng") : undefined}
                        className={`flex w-full items-center rounded-md text-sm text-sidebar-foreground transition-colors duration-200 hover:bg-sidebar-hover ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
                    />
                }
            >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/10 text-sidebar-primary">
                    <Store size={16} />
                </span>

                {!collapsed && (
                    <>
                        <span className="relative min-w-0 flex-1 truncate text-left font-medium">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={isLoading ? "loading" : activeRestaurant?.name ?? "empty"}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="block truncate"
                                >
                                    {isLoading ? "Đang tải..." : activeRestaurant?.name ?? "Chọn nhà hàng"}
                                </motion.span>
                            </AnimatePresence>
                        </span>

                        <ChevronsUpDown size={15} className="shrink-0 text-muted-foreground" />
                    </>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" sideOffset={6} className="w-60">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        Đang quản lý
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {restaurants.map((restaurant: any) => {
                    const isActive = restaurant._id === activeRestaurantId

                    return (
                        <DropdownMenuItem
                            key={restaurant._id}
                            onClick={() => handleSelect(restaurant._id)}
                            className="gap-2 py-2"
                        >
                            <Store size={15} className="shrink-0 text-muted-foreground" />

                            <span className="min-w-0 flex-1 truncate">
                                {restaurant.name}
                            </span>

                            {isActive && <Check size={15} className="shrink-0 text-sidebar-primary" />}
                        </DropdownMenuItem>
                    )
                })}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => navigate("/owner/restaurants")}
                    className="py-2"
                >
                    <Store size={15} className="shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">Tất cả quán của tôi</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default RestaurantSwitcher
