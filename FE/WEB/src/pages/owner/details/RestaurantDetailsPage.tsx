import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ResultDialog from "@/components/common/ResultDialog"
import TimePicker from "@/components/common/TimePicker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import socket from "@/services/core/socket"
import { getRestaurantById, updateRestaurant, updateRestaurantImage, updateRestaurantStatus } from "@/services/restaurant.service"
import { uploadImage } from "@/services/upload.service"
import type { RestaurantStatus } from "@/types/restaurants"
import { formatDateTime } from "@/utils/dateFormat"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import { approvalStatusConfig, restaurantStatusConfig, userStatusConfig } from "@/utils/statusConfig"
import { Image as ImageIcon, Pencil, Save, Star, Store, Upload, MapPin, Clock3, Tags, Power, UserRound, Settings2 } from "lucide-react"
import EmptyState from "@/components/ui/empty-state"

const INITIAL_FORM = {
    name: "",
    description: "",
    phone: "",
    address: "",
    openTime: "08:00",
    closeTime: "22:00"
}

function RestaurantDetailsPage() {
    const { restaurantId } = useParams()
    const [restaurant, setRestaurant] = useState<any>()
    const [form, setForm] = useState(INITIAL_FORM)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })

    const [logoPreview, setLogoPreview] = useState("")
    const [coverPreview, setCoverPreview] = useState("")

    const buildForm = (data: any) => ({
        name: data.name ?? "",
        description: data.description ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        openTime: data.openTime ?? "08:00",
        closeTime: data.closeTime ?? "22:00"
    })

    useEffect(() => {
        setIsLoading(true)
        const loadData = async () => {
            if (!restaurantId) return
            try {
                const response = await getRestaurantById(restaurantId)
                const data = response.data
                setRestaurant(data)
                setForm(buildForm(data))
            }
            catch (error) {
                setRestaurant(null)
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
    }, [restaurantId, reloadKey])

    useEffect(() => {
        const handleReload = () => {
            setReloadKey((current) => current + 1)
        }

        socket.on("restaurant:updated", handleReload)
        socket.on("restaurant:deleted", handleReload)
        socket.on("connect", handleReload)

        return () => {
            socket.off("restaurant:updated", handleReload)
            socket.on("restaurant:deleted", handleReload)
            socket.off("connect", handleReload)
        }
    }, [restaurantId])

    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview)
            if (coverPreview) URL.revokeObjectURL(coverPreview)
        }
    }, [logoPreview, coverPreview])

    const handleSave = async () => {
        if (!restaurantId) { return }

        setIsLoading(true)
        try {
            await updateRestaurant(restaurantId, {
                name: form.name.trim(),
                description: form.description.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                openTime: form.openTime,
                closeTime: form.closeTime
            })
            setIsEditing(false)
            setResult({
                isOpen: true,
                isSuccess: true,
                message: "Đã cập nhật thông tin nhà hàng."
            })
        }
        catch (error) {
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

    const handleToggleStatus = async () => {
        if (!restaurantId || !restaurant) return
        const nextStatus: RestaurantStatus = restaurant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        try {
            await updateRestaurantStatus(restaurantId, nextStatus)
            setRestaurant({ ...restaurant, status: nextStatus })
            setResult({
                isOpen: true,
                isSuccess: true,
                message: nextStatus === "ACTIVE" ? "Quán đã mở cửa trở lại." : "Quán đã tạm ngừng."
            })
        }
        catch (error) {
            setResult({
                isOpen: true,
                isSuccess: false,
                message: getLocalizedErrorMessage(getErrorData(error))
            })
        }
    }

    const handleImageSelect = async (file: File, type: "logo" | "cover") => {
        if (!restaurantId) return

        const preview = URL.createObjectURL(file)
        if (type === "logo") {
            setLogoPreview(preview)
        }
        else {
            setCoverPreview(preview)
        }

        try {
            const image = await uploadImage(file)
            await updateRestaurantImage(restaurantId, type === "logo" ? { logoImage: image } : { coverImage: image })
            setResult({
                isOpen: true,
                isSuccess: true,
                message: type === "logo" ? "Đã cập nhật logo nhà hàng." : "Đã cập nhật ảnh bìa nhà hàng."
            })
        }
        catch (error) {
            setResult({
                isOpen: true,
                isSuccess: false,
                message: getLocalizedErrorMessage(getErrorData(error))
            })
        }
    }

    const statusItem = restaurantStatusConfig[restaurant?.status ?? "INACTIVE"]
    const approvalItem = approvalStatusConfig[restaurant?.approvalStatus ?? "PENDING"]
    const accountStatusItem = restaurant?.userId ? (userStatusConfig[restaurant?.userId.status] ?? userStatusConfig.INACTIVE) : null

    if (!restaurant) {
        return (
            <EmptyState
                title="Không tìm thấy thông tin của nhà hàng"
                description="Thêm món ăn đầu tiên để khách hàng có thể đặt món."
                icon={Store}
            />
        )
    }

    return (
        <div className="flex min-h-0 flex-col overflow-hidden">
            <section className="relative h-36 shrink-0 overflow-hidden border-b border-border-default bg-card sm:h-40 lg:h-44">
                {coverPreview || restaurant.coverImage ? (
                    <img src={coverPreview || restaurant.coverImage} className="size-full object-cover object-center" />
                ) : (
                    <div className="flex size-full items-center justify-center bg-background-surface-tinted text-muted-foreground">
                        <ImageIcon className="size-8" />
                    </div>
                )}

                <label className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/35">
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                            const selected = event.target.files?.[0]
                            if (!selected) return
                            handleImageSelect(selected, "cover")
                            event.target.value = ""
                        }}
                    />

                    <span className="flex translate-y-1 items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-sm font-medium text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                        <Upload className="size-4" />
                    </span>
                </label>

                <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/60 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-4 sm:px-7">
                    <div className="flex min-w-0 items-end gap-3">
                        <label className="group relative block size-18 shrink-0 cursor-pointer sm:size-20">
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) => {
                                    const selected = event.target.files?.[0]
                                    if (!selected) return
                                    handleImageSelect(selected, "logo")
                                    event.target.value = ""
                                }}
                            />

                            <div className="size-full overflow-hidden rounded-2xl border-4 border-card bg-background-surface shadow-sm">
                                {logoPreview || restaurant.logoImage ? (
                                    <img src={logoPreview || restaurant.logoImage} className="size-full object-cover" />
                                ) : (
                                    <div className="flex size-full items-center justify-center bg-background-surface-tinted text-muted-foreground">
                                        <ImageIcon className="size-8" />
                                    </div>
                                )}
                            </div>

                            <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <Upload className="size-5" />
                            </span>
                        </label>

                        <div className="min-w-0 pb-0.5 text-white">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-2xl text-primary-foreground font-semibold tracking-tight sm:text-3xl">{restaurant.name}</h1>
                                <Badge tone={statusItem.tone}>{statusItem.label}</Badge>
                                <Badge tone={approvalItem.tone}>{approvalItem.label}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => { setIsEditing(false) }}>
                                    Huỷ
                                </Button>

                                <Button loading={isLoading} onClick={handleSave}>
                                    <Save className="size-4" />
                                    Lưu thay đổi
                                </Button>
                            </>
                        ) : (
                            <Button variant="default" onClick={() => setIsEditing(true)}>
                                <Pencil className="size-4" />
                                Chỉnh sửa
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <div className="min-h-0 flex-1 overflow-hidden px-5 py-4 sm:px-7 lg:px-8">
                <div className="mx-auto grid min-h-0 max-w-350 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
                    <main className="min-w-0">
                        <div className="grid grid-cols-2 gap-x-7 gap-y-5">
                            <section className="col-span-2 min-w-0">
                                <div className="mb-2 border-b border-border-default pb-2">
                                    <div className="flex items-center gap-2">
                                        <Store className="size-5" />
                                        <h2 className="text-base font-semibold text-foreground">Thông tin quán</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">Thông tin cơ bản của nhà hàng.</p>
                                </div>

                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-foreground">Số điện thoại</Label>
                                            <Input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-foreground">Mô tả</Label>
                                            <textarea
                                                value={form.description}
                                                onChange={(event) => setForm({ ...form, description: event.target.value })}
                                                rows={5}
                                                className="hide-scrollbar w-full resize-none rounded-lg border border-border-control bg-background-surface px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-10 gap-y-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                            <p className="mt-0.5 text-sm font-medium text-foreground">{restaurant.phone}</p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm text-muted-foreground">Mô tả</p>
                                            <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-text-secondary">{restaurant.description}</p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="min-w-0 border-t border-border-default pt-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-5" />
                                    <h3 className="text-base font-semibold text-foreground">Địa chỉ</h3>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground border-b border-border-default pb-2">Vị trí và địa chỉ của nhà hàng.</p>

                                {isEditing ? (
                                    <Input
                                        value={form.address}
                                        onChange={(event) => setForm({ ...form, address: event.target.value })}
                                        className="mt-2 h-9"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm leading-5 text-text-secondary">{restaurant.address}</p>
                                )}
                            </section>

                            <section className="min-w-0 border-t border-border-default pt-3">
                                <div className="flex items-center gap-2">
                                    <Clock3 className="size-5" />
                                    <h3 className="text-base font-semibold text-foreground">Giờ hoạt động</h3>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground border-b border-border-default pb-2">Thời gian mở cửa và đóng cửa.</p>

                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1">
                                                <TimePicker
                                                    value={form.openTime}
                                                    onChange={(value) => setForm({ ...form, openTime: value })}
                                                    className="h-9"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <TimePicker
                                                    value={form.closeTime}
                                                    onChange={(value) => setForm({ ...form, closeTime: value })}
                                                    className="h-9"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Mở cửa</p>
                                                <p className="mt-0.5 text-sm font-medium text-foreground">{restaurant.openTime}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground">Đóng cửa</p>
                                                <p className="mt-0.5 text-sm font-medium text-foreground">{restaurant.closeTime}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                            <section className="min-w-0 border-t border-border-default pt-3">
                                <div className="flex items-center gap-2">
                                    <Tags className="size-5" />
                                    <h3 className="text-base font-semibold text-foreground">Danh mục phục vụ</h3>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground border-b border-border-default pb-2">Các nhóm món ăn nhà hàng đang phục vụ.</p>

                                {restaurant?.categories.length > 0 ? (
                                    <ul className="mt-2 flex flex-wrap gap-1">
                                        {restaurant?.categories.map((category: any) => (
                                            <li key={category._id}>
                                                <Badge tone="brand" className="h-auto px-2.5 py-1 text-sm">{category.name}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">Chưa gán danh mục nào.</p>
                                )}
                            </section>

                            <section className="min-w-0 border-t border-border-default pt-3">
                                <div className="flex items-center gap-2">
                                    <Star className="size-5" />
                                    <h3 className="text-base font-semibold text-foreground">Đánh giá</h3>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground border-b border-border-default pb-2">Phản hồi và mức độ hài lòng của khách hàng.</p>

                                <div className="mt-3 flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="size-5 fill-current text-primary-hover" />
                                        <span className="text-xl font-semibold text-foreground">
                                            {(restaurant?.totalReviews ?? 0) > 0 ? restaurant.rating / 5 : "—"}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {(restaurant?.totalReviews ?? 0) > 0 ? `${restaurant.totalReviews} đánh giá` : "Chưa có đánh giá"}
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">Phản hồi từ khách hàng</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>

                    <aside className="min-w-0 border-l border-border-default pl-6">
                        <div className="space-y-3.5">
                            <section>
                                <div className="mb-2 border-b border-border-default pb-2">
                                    <div className="flex items-center gap-2">
                                        <Power className="size-5" />
                                        <h2 className="text-base font-semibold text-foreground">Trạng thái kinh doanh</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">Trạng thái hoạt động hiện tại của nhà hàng.</p>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <Badge tone={statusItem.tone}>{statusItem.label}</Badge>
                                        {restaurant.approvalStatus !== "APPROVED" && (
                                            <p className="mt-1 text-sm text-muted-foreground">Hồ sơ: {approvalItem.label}</p>
                                        )}
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="default"
                                        disabled={restaurant.approvalStatus !== "APPROVED"}
                                        onClick={handleToggleStatus}
                                    >
                                        {restaurant?.status === "ACTIVE" ? "Tạm ngừng" : "Mở cửa"}
                                    </Button>
                                </div>

                                {restaurant?.rejectionReason?.trim() && (
                                    <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm leading-5 text-destructive">{restaurant?.rejectionReason?.trim()}</p>
                                )}
                            </section>

                            <section className="border-t border-border-default pt-4">
                                <div className="mb-2 border-b border-border-default pb-2">
                                    <div className="flex items-center gap-2">
                                        <UserRound className="size-5" />
                                        <h2 className="text-base font-semibold text-foreground">Tài khoản quán</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">Thông tin tài khoản quản lý nhà hàng.</p>
                                </div>

                                {restaurant?.userId ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-1 gap-4 items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Chủ quán</p>
                                            <p className="mt-0.5 text-primary-hover text-sm font-bold">{restaurant?.userId.fullname}</p>
                                        </div>

                                        <div className="flex flex-1 gap-4 items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="mt-0.5 text-primary-hover text-sm font-bold">{restaurant?.userId.email}</p>
                                        </div>

                                        <div className="flex flex-1 gap-4 items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Trạng thái</p>
                                            <Badge tone={accountStatusItem?.tone ?? "neutral"}>{accountStatusItem?.label}</Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Tài khoản được tạo sau khi hồ sơ được duyệt.</p>
                                )}
                            </section>

                            <section className="border-t border-border-default pt-4">
                                <div className="mb-2 border-b border-border-default pb-2">
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="size-5" />
                                        <h2 className="text-base font-semibold text-foreground">Thông tin quản lý</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">Thông tin vận hành và thời gian quản lý.</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-1 gap-4 items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Hoa hồng</p>
                                        <p className="mt-0.5 text-primary-hover text-sm font-bold">{restaurant.commissionRate}%</p>
                                    </div>

                                    <div className="flex flex-1 gap-4 items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Đăng ký</p>
                                        <p className="mt-0.5 text-primary-hover text-sm font-bold">{formatDateTime(restaurant.createdAt)}</p>
                                    </div>

                                    <div className="flex flex-1 gap-4 items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Cập nhật</p>
                                        <p className="mt-0.5 text-primary-hover text-sm font-bold">{formatDateTime(restaurant.updatedAt)}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            </div>

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(open) => setResult((current) => ({ ...current, isOpen: open }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

export default RestaurantDetailsPage