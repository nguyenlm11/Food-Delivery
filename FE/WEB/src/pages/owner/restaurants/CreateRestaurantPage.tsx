import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PageHeader from "@/components/common/PageHeader"
import ResultDialog from "@/components/common/ResultDialog"
import TimePicker from "@/components/common/TimePicker"
import { getAllCategories } from "@/services/category.service"
import { createRestaurant } from "@/services/restaurant.service"
import { uploadImage } from "@/services/upload.service"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"
import type { CreateRestaurantParams } from "@/types/restaurants"
import { searchAddress } from "@/services/core/geoapify"

const INITIAL_FORM: CreateRestaurantParams = {
    name: "",
    description: "",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    openTime: "08:00",
    closeTime: "22:00",
    categoryIds: [],
}

const INITIAL_ERRORS = {
    name: "",
    phone: "",
    address: "",
    categories: "",
}

function CreateRestaurantPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState<CreateRestaurantParams>(INITIAL_FORM)
    const [errors, setErrors] = useState(INITIAL_ERRORS)
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState("")
    const [coverPreview, setCoverPreview] = useState("")
    const [categories, setCategories] = useState<any[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
    const [isLoadingAddress, setIsLoadingAddress] = useState(false)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getAllCategories({ status: "ACTIVE", limit: 100 })
                setCategories(response?.data?.categories ?? [])
            } catch {
                setCategories([])
            } finally {
                setIsLoadingCategories(false)
            }
        }
        loadCategories()
    }, [])

    useEffect(() => {
        const address = form.address.trim()

        if (address.length < 3 || (form.latitude && form.longitude)) {
            return
        }

        const timer = setTimeout(async () => {
            try {
                setIsLoadingAddress(true)
                const response = await searchAddress(address)
                setAddressSuggestions(response?.features ?? [])
            }
            catch {
                setAddressSuggestions([])
            }
            finally {
                setIsLoadingAddress(false)
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [form.address, form.latitude, form.longitude])

    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview)
            if (coverPreview) URL.revokeObjectURL(coverPreview)
        }
    }, [logoPreview, coverPreview])

    const showResult = (success: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess: success, message })
    }

    const handleToggleCategory = (categoryId: string) => {
        setForm({
            ...form,
            categoryIds: form.categoryIds.includes(categoryId) ? form.categoryIds.filter(id => id !== categoryId) : [...form.categoryIds, categoryId]
        })
        setErrors({ ...errors, categories: "" })
    }

    const handleSelectAddress = (feature: any) => {
        const { formatted, lat, lon } = feature.properties
        setForm({ ...form, address: formatted, latitude: lat, longitude: lon })
        setAddressSuggestions([])
        setErrors({ ...errors, address: "" })
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        const nextErrors = {
            name: form.name.trim() ? "" : "Vui lòng nhập tên quán",
            phone: Number(form.phone.trim()) ? "" : "Vui lòng nhập số điện thoại",
            address: form.address.trim() && form.latitude !== 0 && form.longitude !== 0 ? "" : "Vui lòng chọn địa chỉ từ danh sách gợi ý",
            categories: form.categoryIds.length > 0 ? "" : "Vui lòng chọn ít nhất một danh mục",
        }

        setErrors(nextErrors)
        if (nextErrors.name || nextErrors.phone || nextErrors.address || nextErrors.categories) return
        setIsSubmitting(true)

        try {
            const logoImage = logoFile ? await uploadImage(logoFile) : undefined
            const coverImage = coverFile ? await uploadImage(coverFile) : undefined
            await createRestaurant({
                name: form.name.trim(),
                description: form.description?.trim(),
                logoImage,
                coverImage,
                phone: form.phone.trim(),
                address: form.address.trim(),
                latitude: form.latitude,
                longitude: form.longitude,
                openTime: form.openTime,
                closeTime: form.closeTime,
                categoryIds: form.categoryIds,
            })
            showResult(true, "Quán ăn đã được gửi đăng ký. Hồ sơ sẽ ở trạng thái chờ duyệt.")
        }
        catch (error) {
            showResult(false, getLocalizedErrorMessage(getErrorData(error)))
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
            <PageHeader title="Đăng ký quán mới" description="Hồ sơ sẽ ở trạng thái chờ duyệt sau khi gửi." />
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-default bg-card">
                <div className="hide-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Thông tin quán</h3>
                        <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Tên quán
                                    <Input
                                        value={form.name}
                                        onChange={event => {
                                            setForm({ ...form, name: event.target.value })
                                            setErrors({ ...errors, name: "" })
                                        }}
                                        placeholder="Ví dụ: Quán Phở Hà Nội"
                                        aria-invalid={Boolean(errors.name)}
                                        className="h-10 px-3"
                                    />
                                </Label>
                                <div className="h-4">{errors.name && <FieldError className="text-xs leading-4">{errors.name}</FieldError>}</div>
                            </div>

                            <div className="space-y-1">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Số điện thoại
                                    <Input
                                        type="tel"
                                        value={form.phone}
                                        onChange={event => {
                                            setForm({ ...form, phone: event.target.value })
                                            setErrors({ ...errors, phone: "" })
                                        }}
                                        placeholder="0912345678"
                                        aria-invalid={Boolean(errors.phone)}
                                        className="h-10 px-3"
                                    />
                                </Label>
                                <div className="h-4">{errors.phone && <FieldError className="text-xs leading-4">{errors.phone}</FieldError>}</div>
                            </div>

                            <div className="relative space-y-1 sm:col-span-2">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Địa chỉ
                                    <Input
                                        value={form.address}
                                        onChange={event => {
                                            setForm({ ...form, address: event.target.value, latitude: 0, longitude: 0 })
                                            setErrors({ ...errors, address: "" })
                                        }}
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                                        aria-invalid={Boolean(errors.address)}
                                        className="h-10 px-3"
                                    />
                                </Label>

                                {form.address.trim().length >= 3 && (isLoadingAddress || addressSuggestions.length > 0) && (
                                    <div className="absolute left-0 right-0 z-20 overflow-hidden rounded-lg border border-border-default bg-background shadow-md">
                                        {isLoadingAddress ? (
                                            <div className="px-3 py-2.5 text-xs text-muted-foreground">Đang tìm địa chỉ...</div>
                                        ) : (
                                            addressSuggestions.map((feature: any) => (
                                                <button
                                                    key={feature.properties.place_id}
                                                    type="button"
                                                    onClick={() => handleSelectAddress(feature)}
                                                    className="block w-full px-3 py-2.5 text-left text-xs text-foreground hover:bg-background-surface-hover"
                                                >
                                                    {feature.properties.formatted}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                                <div className="h-4">{errors.address && <FieldError className="text-xs leading-4">{errors.address}</FieldError>}</div>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Mô tả quán
                                    <textarea
                                        className="w-full resize-none rounded-lg border border-border-control bg-background-surface px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                                        value={form.description}
                                        onChange={event => setForm({ ...form, description: event.target.value })}
                                        placeholder="Món ăn đặc trưng, không gian và trải nghiệm của quán"
                                        rows={5}
                                    />
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Giờ hoạt động</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <p className="text-xs text-muted-foreground">Giờ mở cửa</p>
                                    <TimePicker value={form.openTime} onChange={value => setForm({ ...form, openTime: value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs text-muted-foreground">Giờ đóng cửa</p>
                                    <TimePicker value={form.closeTime} onChange={value => setForm({ ...form, closeTime: value })} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-border-default pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                        <h3 className="text-sm font-semibold text-foreground">Thông tin bổ sung</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <p className="text-sm font-medium text-foreground">Ảnh đại diện</p>
                                {logoPreview ? (
                                    <div className="flex h-19 items-center gap-2 rounded-lg border border-border-default bg-background p-2">
                                        <img src={logoPreview} alt="Ảnh đại diện" className="size-10 shrink-0 rounded-lg object-cover" />
                                        <span className="min-w-0 flex-1 truncate text-xs text-foreground">{logoFile?.name}</span>
                                        <Button type="button" size="icon-sm" onClick={() => { setLogoFile(null), setLogoPreview("") }}>
                                            <Trash className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="flex h-19 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-strong bg-background p-2 transition-colors hover:border-primary-hover hover:bg-brand-primary-soft">
                                        <input
                                            type="file"
                                            onChange={event => {
                                                const file = event.target.files?.[0]
                                                if (!file) return
                                                setLogoFile(file)
                                                setLogoPreview(URL.createObjectURL(file))
                                            }}
                                            accept="image/*"
                                            className="sr-only"
                                        />
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-strong">
                                            <Upload className="size-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-xs font-medium text-foreground">Chọn ảnh</span>
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-sm font-medium text-foreground">Ảnh bìa</p>
                                {coverPreview ? (
                                    <div className="flex h-19 items-center gap-2 rounded-lg border border-border-default bg-background p-2">
                                        <img src={coverPreview} alt="Ảnh bìa" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                                        <span className="min-w-0 flex-1 truncate text-xs text-foreground">{coverFile?.name}</span>
                                        <Button type="button" size="icon-sm" onClick={() => { setCoverFile(null), setCoverPreview("") }}>
                                            <Trash className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="flex h-19 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-strong bg-background p-2 transition-colors hover:border-primary-hover hover:bg-brand-primary-soft">
                                        <input
                                            type="file"
                                            onChange={event => {
                                                const file = event.target.files?.[0]
                                                if (!file) return
                                                setCoverFile(file)
                                                setCoverPreview(URL.createObjectURL(file))
                                            }}
                                            accept="image/*"
                                            className="sr-only"
                                        />
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-strong">
                                            <Upload className="size-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-xs font-medium text-foreground">Chọn ảnh</span>
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Danh mục</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category: any) => {
                                    const isSelected = form.categoryIds.includes(category._id)
                                    return (
                                        <button
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? "border-brand-primary-hover bg-brand-primary-soft text-brand-primary-strong" : "border-border-default bg-background-surface text-foreground hover:border-border-strong hover:bg-background-surface-hover"}`}
                                            key={category._id}
                                            type="button"
                                            onClick={() => handleToggleCategory(category._id)}
                                        >
                                            {category.name}
                                        </button>
                                    )
                                })}
                                {categories.length === 0 && <p className="text-xs text-muted-foreground">Chưa có danh mục khả dụng.</p>}
                            </div>
                            <div className="h-4">{errors.categories && <FieldError className="text-xs leading-4">{errors.categories}</FieldError>}</div>
                        </div>
                    </section>
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-border-default px-4 py-3 sm:px-5">
                    <Button type="button" variant="outline" onClick={() => navigate("/owner/restaurants")} className="h-10">
                        Hủy
                    </Button>
                    <Button type="submit" loading={isSubmitting} disabled={isLoadingCategories} className="h-10">
                        Gửi đăng ký
                    </Button>
                </div>
            </form>

            <ResultDialog
                open={result.isOpen}
                onOpenChange={isOpen => {
                    setResult(current => ({ ...current, isOpen }))
                    if (!isOpen && result.isSuccess) navigate("/owner/restaurants")
                }}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </div>
    )
}

export default CreateRestaurantPage