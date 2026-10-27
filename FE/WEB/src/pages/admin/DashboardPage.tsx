import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleAlert, CircleCheck, Clock3, Download, Info, Package, Plus, Store, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "../../components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

type MetricTrend = "up" | "down"
type MetricTone = "brand" | "info" | "success" | "warning"
type StatusTone = "success" | "warning" | "error" | "info"

interface Metric {
    label: string
    value: string
    delta: string
    comparison: string
    trend: MetricTrend
    tone: MetricTone
    icon: LucideIcon
}

interface RecentOrder {
    id: string
    customer: string
    restaurant: string
    total: string
    status: string
    tone: StatusTone
}

interface Activity {
    id: number
    title: string
    time: string
    icon: LucideIcon
    tone: MetricTone
}

const metrics: Metric[] = [
    {
        label: "Doanh thu hôm nay",
        value: "₫ 128.450.000",
        delta: "+12,4%",
        comparison: "so với hôm qua",
        trend: "up",
        tone: "brand",
        icon: Wallet,
    },
    {
        label: "Đơn hàng",
        value: "1.284",
        delta: "+8,1%",
        comparison: "so với hôm qua",
        trend: "up",
        tone: "info",
        icon: Package,
    },
    {
        label: "Người dùng hoạt động",
        value: "8.492",
        delta: "-2,3%",
        comparison: "so với tuần trước",
        trend: "down",
        tone: "warning",
        icon: Users,
    },
    {
        label: "Nhà hàng hoạt động",
        value: "346",
        delta: "+5,7%",
        comparison: "so với tháng trước",
        trend: "up",
        tone: "success",
        icon: Store,
    },
]

const metricToneClasses: Record<MetricTone, string> = {
    brand: "bg-brand-primary-soft text-brand-primary-strong",
    info: "bg-status-info/10 text-status-info",
    success: "bg-status-success/5 text-status-success",
    warning: "bg-status-warning/5 text-status-warning",
}

const revenueSeries = [
    { label: "T2", revenue: 58, orders: 44 },
    { label: "T3", revenue: 72, orders: 52 },
    { label: "T4", revenue: 46, orders: 38 },
    { label: "T5", revenue: 84, orders: 61 },
    { label: "T6", revenue: 68, orders: 55 },
    { label: "T7", revenue: 92, orders: 70 },
    { label: "CN", revenue: 76, orders: 63 },
]

const orderBreakdown = [
    { label: "Chờ xác nhận", value: 128, percent: 42, barClass: "bg-status-info" },
    { label: "Đang chuẩn bị", value: 84, percent: 28, barClass: "bg-status-warning" },
    { label: "Đang giao hàng", value: 56, percent: 18, barClass: "bg-brand-primary" },
    { label: "Hoàn tất", value: 36, percent: 12, barClass: "bg-status-success" },
]

const recentOrders: RecentOrder[] = [
    { id: "#FD-10248", customer: "Nguyễn Minh Anh", restaurant: "Bún Hà Nội", total: "₫ 186.000", status: "Hoàn tất", tone: "success" },
    { id: "#FD-10247", customer: "Trần Thu Hà", restaurant: "Cà phê Bia Mộc", total: "₫ 92.000", status: "Đang giao", tone: "info" },
    { id: "#FD-10246", customer: "Lê Quang Vinh", restaurant: "Lẩu Hải Sản 24", total: "₫ 540.000", status: "Chờ xác nhận", tone: "warning" },
    { id: "#FD-10245", customer: "Phạm Bảo Châu", restaurant: "Gà Nướng Mận", total: "₫ 315.000", status: "Đã hủy", tone: "error" },
]

const statusToneClasses: Record<StatusTone, string> = {
    success: "bg-status-success/5 text-status-success",
    warning: "bg-status-warning/5 text-status-warning",
    error: "bg-status-error/10 text-status-error",
    info: "bg-status-info/10 text-status-info",
}

const activities: Activity[] = [
    { id: 1, title: "Nhà hàng Bún Hà Nội vừa cập nhật thực đơn", time: "4 phút trước", icon: Store, tone: "brand" },
    { id: 2, title: "Đơn #FD-10246 đang chờ xác nhận", time: "12 phút trước", icon: Clock3, tone: "warning" },
    { id: 3, title: "Tài xế Hoàng Văn Dũng đã nhận đơn", time: "28 phút trước", icon: Package, tone: "info" },
    { id: 4, title: "Thanh toán đơn #FD-10243 hoàn tất", time: "1 giờ trước", icon: CircleCheck, tone: "success" },
]

const swatches: { label: string, className: string }[] = [
    { label: "Brand primary", className: "bg-brand-primary" },
    { label: "Brand hover", className: "bg-brand-primary-hover" },
    { label: "Brand strong", className: "bg-brand-primary-strong" },
    { label: "Brand soft", className: "bg-brand-primary-soft ring-1 ring-brand-primary/25" },
    { label: "Surface tinted", className: "bg-background-surface-tinted ring-1 ring-border-default" },
    { label: "Surface hover", className: "bg-background-surface-hover" },
    { label: "Success", className: "bg-status-success" },
    { label: "Warning", className: "bg-status-warning" },
    { label: "Error", className: "bg-status-error" },
    { label: "Info", className: "bg-status-info" },
]

function MetricCard({ metric }: { metric: Metric }) {
    const MetricIcon = metric.icon
    const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight

    return (
        <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-2">
                <CardDescription className="text-text-secondary">{metric.label}</CardDescription>
                <CardAction>
                    <span className={cn("grid size-9 place-items-center rounded-lg", metricToneClasses[metric.tone])}>
                        <MetricIcon className="size-4" />
                    </span>
                </CardAction>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <p className="text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                        metric.trend === "up"
                            ? "bg-status-success/5 text-status-success"
                            : "bg-status-error/10 text-status-error",
                    )}
                    >
                        <TrendIcon className="size-3" />
                        {metric.delta}
                    </span>
                    <span className="text-muted-foreground">{metric.comparison}</span>
                </p>
            </CardContent>
        </Card>
    )
}

function DashboardPage() {
    const navigate = useNavigate()
    const [range, setRange] = useState("7")

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Tổng quan hệ thống</h2>
                    <p className="text-sm text-text-secondary">
                        Theo dõi doanh thu, đơn hàng và hoạt động của các thành phần trong hệ thống FoodDelivery.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={range} onValueChange={(value) => value && setRange(value)}>
                        <SelectTrigger className="w-44" aria-label="Khoảng thời gian">
                            <CalendarDays className="size-4 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectGroup>
                                <SelectItem value="1">Hôm nay</SelectItem>
                                <SelectItem value="7">7 ngày gần nhất</SelectItem>
                                <SelectItem value="30">30 ngày gần nhất</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="bg-background hover:bg-background-surface-hover">
                        <Download className="size-4" />
                        Xuất báo cáo
                    </Button>

                    <Button onClick={() => navigate("/admin/food-categories")}>
                        <Plus className="size-4" />
                        Thêm danh mục
                    </Button>
                </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <MetricCard key={metric.label} metric={metric} />
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Card className="gap-0 py-0 lg:col-span-2">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle>Doanh thu theo ngày</CardTitle>
                        <CardDescription>So sánh doanh thu và số đơn hàng trong kỳ đang chọn.</CardDescription>
                        <CardAction>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-medium text-brand-primary-strong">
                                <TrendingUp className="size-3" />
                                +12,4%
                            </span>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="px-5 pt-2 pb-4">
                        <div className="flex items-end gap-2 border-b border-border pb-2 sm:gap-3">
                            {revenueSeries.map((point) => (
                                <div key={point.label} className="group flex flex-1 flex-col items-center gap-2">
                                    <div className="flex h-44 w-full items-end justify-center gap-1">
                                        <div
                                            className="w-2.5 rounded-t-sm bg-chart-1/85 transition-colors group-hover:bg-chart-1"
                                            style={{ height: `${point.revenue}%` }}
                                        />
                                        <div
                                            className="w-2.5 rounded-t-sm bg-chart-2/70 transition-colors group-hover:bg-chart-2"
                                            style={{ height: `${point.orders}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{point.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-wrap items-center gap-4 bg-muted/40">
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="size-2.5 rounded-sm bg-chart-1" />
                            Doanh thu
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="size-2.5 rounded-sm bg-chart-2" />
                            Số đơn hàng
                        </span>
                    </CardFooter>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle>Trạng thái đơn hàng</CardTitle>
                        <CardDescription>Phân bố đơn đang xử lý theo trạng thái.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-5 py-3">
                        {orderBreakdown.map((item) => (
                            <div key={item.label} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">{item.label}</span>
                                    <span className="font-medium text-text-strong">{item.value}</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div className={cn("h-full rounded-full", item.barClass)} style={{ width: `${item.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="justify-between bg-muted/40 text-xs text-muted-foreground">
                        <span>Tổng đơn trong kỳ</span>
                        <span className="font-semibold text-foreground">304 đơn</span>
                    </CardFooter>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Card className="gap-0 py-0 lg:col-span-2">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle>Đơn hàng gần đây</CardTitle>
                        <CardDescription>Các đơn được cập nhật gần nhất trong hệ thống.</CardDescription>
                        <CardAction>
                            <Button variant="ghost" size="sm" className="text-text-secondary" onClick={() => navigate("/admin/orders")}>
                                Xem tất cả
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="px-0 pb-1">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-150 text-sm">
                                <thead>
                                    <tr className="border-y bg-muted/40 text-left">
                                        <th className="h-10 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Mã đơn</th>
                                        <th className="h-10 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Khách hàng</th>
                                        <th className="h-10 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Nhà hàng</th>
                                        <th className="h-10 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Tổng tiền</th>
                                        <th className="h-10 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b transition-colors last:border-0 hover:bg-background-surface-hover/60">
                                            <td className="px-5 py-3 font-medium text-text-strong">{order.id}</td>
                                            <td className="px-5 py-3 text-foreground">{order.customer}</td>
                                            <td className="px-5 py-3 text-muted-foreground">{order.restaurant}</td>
                                            <td className="px-5 py-3 font-medium text-foreground">{order.total}</td>
                                            <td className="px-5 py-3">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                                    statusToneClasses[order.tone],
                                                )}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle>Hoạt động gần đây</CardTitle>
                        <CardDescription>Nhật ký thay đổi trong hệ thống.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-5 py-2">
                        {activities.map((activity) => {
                            const ActivityIcon = activity.icon

                            return (
                                <div key={activity.id} className="flex gap-3">
                                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", metricToneClasses[activity.tone])}>
                                        <ActivityIcon className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-foreground">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <Card className="gap-0 py-0">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle>Bảng màu Fresh Teal</CardTitle>
                        <CardDescription>Các token màu đang dùng trong giao diện.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 py-2">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                            {swatches.map((swatch) => (
                                <div key={swatch.label} className="space-y-1.5">
                                    <div className={cn("h-10 w-full rounded-lg", swatch.className)} />
                                    <p className="truncate text-xs text-text-secondary">{swatch.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle>Trạng thái tương tác</CardTitle>
                        <CardDescription>Kiểm tra hover, focus, active và disabled của thành phần chính.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-5 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button>Hành động chính</Button>
                            <Button variant="secondary">Thứ cấp</Button>
                            <Button variant="outline" className="bg-background hover:bg-background-surface-hover">Phụ</Button>
                            <Button variant="ghost">Tinh thần</Button>
                            <Button variant="destructive">Phá hủy</Button>
                            <Button disabled>Vô hiệu hóa</Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-medium text-brand-primary-strong">
                                <CircleCheck className="size-3" />
                                Thành công
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-warning/5 px-2.5 py-1 text-xs font-medium text-status-warning">
                                <Clock3 className="size-3" />
                                Đang chờ
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-error/10 px-2.5 py-1 text-xs font-medium text-status-error">
                                <CircleAlert className="size-3" />
                                Lỗi
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-info/10 px-2.5 py-1 text-xs font-medium text-status-info">
                                <Info className="size-3" />
                                Thông tin
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input placeholder="Nhập để kiểm tra focus ring" />
                            <Input placeholder="Trường bị vô hiệu hóa" disabled />
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default DashboardPage
