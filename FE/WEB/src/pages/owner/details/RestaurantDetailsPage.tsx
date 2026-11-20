import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TimePicker from "@/components/common/TimePicker"
import { useState } from "react"
import { Clock, MapPin, Phone, Save } from "lucide-react"
import { approvalStatusConfig, restaurantStatusConfig } from "@/utils/statusConfig"
import { mockRestaurant } from "../restaurants/mockData"

function RestaurantDetailsPage() {
    const [form, setForm] = useState({
        name: mockRestaurant.name,
        description: mockRestaurant.description,
        phone: mockRestaurant.phone,
        address: mockRestaurant.address,
        openTime: mockRestaurant.openTime,
        closeTime: mockRestaurant.closeTime
    })
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 400))
        }
        finally {
            setIsSaving(false)
        }
    }

    const statusItem = restaurantStatusConfig[mockRestaurant.status]
    const approvalItem = approvalStatusConfig[mockRestaurant.approvalStatus]

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <PageHeader
                title="Chi tiết quán"
                description="Cập nhật thông tin hiển thị của nhà hàng trên Foodie."
                action={
                    <Button loading={isSaving} onClick={handleSave}>
                        <Save className="size-4" />Lưu thay đổi
                    </Button>
                }
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <div className="hide-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Thông tin quán</h3>

                        <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Tên quán
                                    <Input
                                        value={form.name}
                                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                                        className="h-10 px-3"
                                    />
                                </Label>
                            </div>

                            <div className="space-y-1">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Số điện thoại
                                    <Input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                        className="h-10 px-3"
                                    />
                                </Label>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Địa chỉ
                                    <Input
                                        value={form.address}
                                        onChange={(event) => setForm({ ...form, address: event.target.value })}
                                        className="h-10 px-3"
                                    />
                                </Label>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label className="flex-col items-start gap-1.5 text-sm font-medium text-foreground">
                                    Mô tả quán
                                    <textarea
                                        value={form.description}
                                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                                        rows={5}
                                        className="w-full resize-none rounded-lg border border-border-control bg-background-surface px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
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
                        <h3 className="text-sm font-semibold text-foreground">Trạng thái</h3>

                        <div className="flex items-center gap-2">
                            <Badge tone={statusItem.tone}>{statusItem.label}</Badge>
                            <Badge tone={approvalItem.tone}>{approvalItem.label}</Badge>
                        </div>

                        <dl className="space-y-3 border-t border-border-default pt-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <dt className="text-xs text-muted-foreground">Địa chỉ</dt>
                                    <dd className="text-sm text-foreground">{mockRestaurant.address}</dd>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <dt className="text-xs text-muted-foreground">Số điện thoại</dt>
                                    <dd className="text-sm text-foreground">{mockRestaurant.phone}</dd>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <dt className="text-xs text-muted-foreground">Giờ hoạt động</dt>
                                    <dd className="text-sm text-foreground">{mockRestaurant.openTime} - {mockRestaurant.closeTime}</dd>
                                </div>
                            </div>
                        </dl>

                        <div className="border-t border-border-default pt-4">
                            <p className="text-xs text-muted-foreground">Phần trăm hoa hồng</p>
                            <p className="text-sm font-medium text-foreground">{mockRestaurant.commissionRate}%</p>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    )
}

export default RestaurantDetailsPage
