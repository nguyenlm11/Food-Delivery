import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import ResultDialog from "@/components/common/ResultDialog"
import ActiveFilters from "@/components/data-table/ActiveFilters"
import EmptyState from "@/components/ui/empty-state"
import Filter from "@/components/data-table/Filter"
import RowActions from "@/components/data-table/RowActions"
import Search from "@/components/data-table/Search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getFoodsByRestaurant } from "@/services/food.service"
import socket from "@/services/core/socket"
import type { ActionTarget, AdminAction } from "@/types/api"
import type { Food, FoodFilterValues, MenuFoodGroup } from "@/types/food.type"
import { foodActionConfig } from "@/utils/actionConfig"
import { foodStatusConfig, menuStatusConfig } from "@/utils/statusConfig"
import { ChevronLeft, ChevronRight, EyeOff, Plus, RotateCcw, Trash, UtensilsCrossed } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CreateFoodModal from "./CreateFoodModal"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

function FoodPage() {
    const { restaurantId } = useParams()
    const [groups, setGroups] = useState<MenuFoodGroup[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<"all" | Food["status"]>("all")
    const [menuId, setMenuId] = useState("all")

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [actionTarget, setActionTarget] = useState<ActionTarget>({ id: "", name: "", action: "hide", title: "" })
    const [confirm, setConfirm] = useState({ isOpen: false, isProcessing: false })
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const trackRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [trackState, setTrackState] = useState<Record<string, { canLeft: boolean, canRight: boolean }>>({})

    useEffect(() => {
        if (!restaurantId) { return }

        const loadData = async () => {
            try {
                const data = await getFoodsByRestaurant(restaurantId, true)
                setGroups(data)
            }
            catch (error) {
                setGroups([])
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: getLocalizedErrorMessage(getErrorData(error))
                })
            }
            finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [restaurantId])

    useEffect(() => {
        const handleReload = () => {
            setIsLoading(true)

            const reload = async () => {
                try {
                    const data = await getFoodsByRestaurant(restaurantId!, true)
                    setGroups(data)
                }
                catch {
                    setGroups([])
                }
                finally {
                    setIsLoading(false)
                }
            }

            void reload()
        }

        socket.on("food:created", handleReload)
        socket.on("food:updated", handleReload)
        socket.on("food:deleted", handleReload)

        return () => {
            socket.off("food:created", handleReload)
            socket.off("food:updated", handleReload)
            socket.off("food:deleted", handleReload)
        }
    }, [restaurantId])

    const menuGroups = groups
        .filter(group => group.status !== "DELETED")
        .filter(group => menuId === "all" || group._id === menuId)
        .map(group => ({
            menu: group,
            foods: group.foods.filter((food) => {
                const keyword = search.trim().toLowerCase()

                if (keyword && !food.name.toLowerCase().includes(keyword)) {
                    return false
                }

                if (status !== "all" && food.status !== status) {
                    return false
                }

                return true
            })
        }))
        .filter(group => group.foods.length > 0)

    const updateTrackState = useCallback((key: string) => {
        const element = trackRefs.current[key]

        if (!element) {
            return
        }

        const canLeft = element.scrollLeft > 4
        const canRight = element.scrollLeft + element.clientWidth < element.scrollWidth - 4

        setTrackState((current) => {
            const previous = current[key]

            if (previous && previous.canLeft === canLeft && previous.canRight === canRight) {
                return current
            }

            return { ...current, [key]: { canLeft, canRight } }
        })
    }, [])

    const scrollTrack = useCallback((key: string, direction: -1 | 1) => {
        const element = trackRefs.current[key]

        if (!element) {
            return
        }

        element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: "smooth" })
    }, [])

    useEffect(() => {
        Object.keys(trackRefs.current).forEach(updateTrackState)
    }, [menuGroups, updateTrackState])

    const openAction = (id: string, name: string, action: AdminAction, title: string) => {
        setActionTarget({ id, name, action, title })
        setConfirm((current) => ({ ...current, isOpen: true }))
    }

    const handleConfirmAction = async () => {
        setConfirm((current) => ({ ...current, isProcessing: true }))

        try {
            const nextStatus = actionTarget.action === "hide"
                ? "INACTIVE"
                : (actionTarget.action === "restore" || actionTarget.action === "restoreDeleted") ? "ACTIVE" : "DELETED"

            setGroups((current) => current.map((group) => ({
                ...group,
                foods: group.foods.map((food) => food._id === actionTarget.id ? { ...food, status: nextStatus } : food)
            })))

            setResult({
                isOpen: true,
                isSuccess: true,
                message: foodActionConfig[actionTarget.action].message
            })
        }
        finally {
            setConfirm((current) => ({ ...current, isProcessing: false, isOpen: false }))
        }
    }

    const handleRemoveFilter = (key: string) => {
        if (key === "search") {
            setSearchInput("")
            setSearch("")
        }
        if (key === "status") {
            setStatus("all")
        }
        if (key === "menuId") {
            setMenuId("all")
        }
    }

    const createButton = (
        <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />Thêm món ăn
        </Button>
    )

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Món ăn"
                description="Ảnh và giá bán là thứ khách nhìn thấy đầu tiên trên thẻ quán."
                action={createButton}
            />

            {isLoading ? (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    Đang tải món ăn...
                </div>
            ) : (
                <>
            <div className="flex shrink-0 flex-col gap-3 rounded-xl border bg-card p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                        <Search
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Tìm theo tên món ăn..."
                            onSearch={() => {
                                setSearch(searchInput.trim())
                            }}
                        />
                    </div>

                    <Filter
                        values={{ status, menuId }}
                        groups={[
                            {
                                key: "menuId",
                                label: "Thực đơn",
                                options: [
                                    { label: "Tất cả", value: "all" },
                                    ...groups
                                        .filter(group => group.status !== "DELETED")
                                        .map(group => ({ label: group.name, value: group._id }))
                                ]
                            },
                            {
                                key: "status",
                                label: "Trạng thái",
                                options: [
                                    { label: "Tất cả", value: "all" },
                                    { label: "Đang bán", value: "ACTIVE" },
                                    { label: "Tạm ngừng", value: "INACTIVE" },
                                    { label: "Đã xóa", value: "DELETED" }
                                ]
                            }
                        ]}
                        onApply={(values: FoodFilterValues) => {
                            setStatus(values.status)
                            setMenuId(values.menuId)
                        }}
                    />
                </div>

                {(search || status !== "all" || menuId !== "all") && (
                    <ActiveFilters
                        filters={[
                            ...(search ? [{ key: "search", label: `Từ khóa: ${search}` }] : []),
                            ...(status !== "all" ? [{ key: "status", label: `Trạng thái: ${foodStatusConfig[status]?.label ?? status}` }] : []),
                            ...(menuId !== "all" ? [{ key: "menuId", label: `Thực đơn: ${groups.find(group => group._id === menuId)?.name ?? menuId}` }] : [])
                        ]}
                        onRemove={handleRemoveFilter}
                    />
                )}
            </div>

            <section className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto">
                {menuGroups.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                        <EmptyState
                            title="Chưa có món ăn nào"
                            description="Thêm món ăn đầu tiên để khách hàng có thể đặt món."
                            icon={UtensilsCrossed}
                            action={createButton}
                        />
                    </div>
                ) : (
                    menuGroups.map((group) => {
                        const trackKey = group.menu._id
                        const track = trackState[trackKey]
                        const menuStatusItem = menuStatusConfig[group.menu.status] ?? menuStatusConfig.ACTIVE

                        return (
                            <section key={trackKey} className="space-y-3">
                                <header className="flex items-center justify-between gap-4 border-b border-border-default pb-2">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <h2 className="text-heading font-semibold text-foreground">{group.menu.name}</h2>

                                        <Badge tone={menuStatusItem.tone}>{menuStatusItem.label}</Badge>

                                        <span className="text-xs text-muted-foreground">{group.foods.length} món</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            aria-label={`Xem món trước trong thực đơn ${group.menu.name}`}
                                            disabled={!track?.canLeft}
                                            onClick={() => scrollTrack(trackKey, -1)}
                                            className="rounded-lg"
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            aria-label={`Xem món tiếp theo trong thực đơn ${group.menu.name}`}
                                            disabled={!track?.canRight}
                                            onClick={() => scrollTrack(trackKey, 1)}
                                            className="rounded-lg"
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                </header>

                                <div
                                    ref={(element) => {
                                        trackRefs.current[trackKey] = element
                                    }}
                                    onScroll={() => updateTrackState(trackKey)}
                                    className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
                                >
                                    {group.foods.map((food, index) => {
                                        const statusItem = foodStatusConfig[food.status] ?? foodStatusConfig.ACTIVE
                                        const isOnSale = food.status === "ACTIVE"

                                        return (
                                            <article
                                                key={food._id}
                                                className="card-in card-lift group flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-xl border bg-card sm:w-64"
                                                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                                            >
                                                <div className="relative aspect-4/3 overflow-hidden bg-background-surface-tinted">
                                                    {food.image ? (
                                                        <img
                                                            src={food.image}
                                                            alt={food.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="card-zoom size-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center text-muted-foreground">
                                                            <UtensilsCrossed className="size-8" aria-hidden="true" />
                                                        </div>
                                                    )}

                                                    {food.status !== "ACTIVE" && (
                                                        <Badge tone={statusItem.tone} className="absolute top-2.5 left-2.5">
                                                            {statusItem.label}
                                                        </Badge>
                                                    )}

                                                    {food.status !== "DELETED" && (
                                                        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 from-black/60 to-transparent p-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="h-8 rounded-lg bg-white/95 text-black hover:bg-white"
                                                                onClick={() => openAction(
                                                                    food._id,
                                                                    food.name,
                                                                    isOnSale ? "hide" : "restore",
                                                                    isOnSale ? "Tạm ngừng" : "Khôi phục"
                                                                )}
                                                            >
                                                                {isOnSale ? <EyeOff className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                                                                {isOnSale ? "Tạm ngừng" : "Khôi phục"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                                                    <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">{food.name}</h3>

                                                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                        {food.description || "Chưa có mô tả cho món này."}
                                                    </p>

                                                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                                                        <span className="text-base font-semibold tabular-nums text-foreground">
                                                            {food.originalPrice.toLocaleString("vi-VN")}đ
                                                        </span>

                                                        <RowActions
                                                            actions={[
                                                                food.status !== "ACTIVE" && {
                                                                    label: food.status === "DELETED" ? "Khôi phục từ thùng rác" : "Khôi phục",
                                                                    icon: <RotateCcw className="size-4" />,
                                                                    onClick: () => openAction(food._id, food.name, food.status === "DELETED" ? "restoreDeleted" : "restore", "Khôi phục")
                                                                },
                                                                food.status !== "DELETED" && {
                                                                    label: "Xóa",
                                                                    icon: <Trash className="size-4" />,
                                                                    onClick: () => openAction(food._id, food.name, "delete", "Xóa")
                                                                }
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })
                )}
            </section>
                </>
            )}

            <ConfirmDialog
                open={confirm.isOpen}
                onOpenChange={(open) => setConfirm((current) => ({ ...current, isOpen: open }))}
                title={`${actionTarget.title} ${actionTarget.name || "món ăn"}?`}
                description={foodActionConfig[actionTarget.action].description}
                confirmLabel={actionTarget.title}
                loading={confirm.isProcessing}
                onConfirm={handleConfirmAction}
            />

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />

            <CreateFoodModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreated={(food) => setGroups((current) => current.map((group) => (
                    group._id === food.menuId ? { ...group, foods: [...group.foods, food] } : group
                )))}
            />
        </div>
    )
}

export default FoodPage
