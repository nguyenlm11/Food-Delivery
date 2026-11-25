import { ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, Zap, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StatCardProps {
    title: string
    value: string | number
    change?: string
    changePercent?: string
    icon: React.ReactNode
    trend?: "up" | "down" | "neutral"
    sparkline?: number[]
}

function StatCard({ title, value, change, changePercent, icon, trend = "neutral", sparkline = [] }: StatCardProps) {
    const bgColors = {
        "up": "bg-status-success/10 text-status-success",
        "down": "bg-status-error/10 text-status-error",
        "neutral": "bg-primary/10 text-primary"
    }

    // Mini sparkline SVG
    const minMax = sparkline.length > 0 ? { min: Math.min(...sparkline), max: Math.max(...sparkline) } : { min: 0, max: 1 }
    const range = minMax.max - minMax.min || 1

    return (
        <div className="card-lift rounded-xl border border-border-default bg-background-surface p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    <p className="mt-1.5 text-2xl font-bold tabular-nums text-text-strong lg:text-3xl">{value}</p>
                </div>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${bgColors[trend]}`}>
                    {icon}
                </div>
            </div>

            {/* Sparkline */}
            {sparkline.length > 0 && (
                <svg viewBox="0 0 100 20" className="mb-3 h-6 w-full" aria-hidden="true">
                    <polyline
                        points={sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * 100},${20 - ((v - minMax.min) / range) * 20}`).join(" ")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={trend === "up" ? "text-status-success" : trend === "down" ? "text-status-error" : "text-primary"}
                    />
                </svg>
            )}

            {/* Change info */}
            {(change || changePercent) && (
                <p className={`flex items-center gap-1 text-xs font-medium ${
                    trend === "up" ? "text-status-success" :
                    trend === "down" ? "text-status-error" :
                    "text-text-secondary"
                }`}>
                    {trend === "up" && <ArrowUpRight className="size-3" aria-hidden="true" />}
                    {trend === "down" && <ArrowDownRight className="size-3" aria-hidden="true" />}
                    {changePercent || change}
                </p>
            )}
        </div>
    )
}

function RestaurantOverviewPage() {
    // Mock data
    const stats = [
        {
            title: "Doanh thu hôm nay",
            value: "2.4M₫",
            changePercent: "+8% so với hôm qua",
            icon: <DollarSign className="size-6" />,
            trend: "up" as const,
            sparkline: [0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 1]
        },
        {
            title: "Tổng đơn hôm nay",
            value: "24",
            changePercent: "+12% so với hôm qua",
            icon: <ShoppingCart className="size-6" />,
            trend: "up" as const,
            sparkline: [0.4, 0.6, 0.5, 0.7, 0.8, 0.9, 1]
        },
        {
            title: "Khách hôm nay",
            value: "18",
            changePercent: "+5% so với hôm qua",
            icon: <Users className="size-6" />,
            trend: "up" as const,
            sparkline: [0.5, 0.6, 0.7, 0.6, 0.8, 0.9, 1]
        },
        {
            title: "Tỉ lệ hoàn thành",
            value: "98%",
            changePercent: "+2% so với hôm qua",
            icon: <Zap className="size-6" />,
            trend: "up" as const,
            sparkline: [0.9, 0.95, 0.92, 0.96, 0.94, 0.98, 1]
        }
    ]

    const revenueData = [
        { date: "T2", revenue: 1.2 },
        { date: "T3", revenue: 1.5 },
        { date: "T4", revenue: 1.8 },
        { date: "T5", revenue: 1.3 },
        { date: "T6", revenue: 2.1 },
        { date: "T7", revenue: 2.4 },
        { date: "CN", revenue: 2.8 }
    ]

    const orderStatus = [
        { label: "Hoàn thành", value: 32, color: "primary" },
        { label: "Chờ giao", value: 8, color: "status-warning" },
        { label: "Hủy", value: 2, color: "status-error" }
    ]

    const topItems = [
        { rank: 1, name: "Phở gà đặc biệt", qty: 24, percent: 32 },
        { rank: 2, name: "Cơm tấm sườn cốt lết", qty: 18, percent: 24 },
        { rank: 3, name: "Bánh mì thịt lợn", qty: 15, percent: 15 },
        { rank: 4, name: "Chè ba màu", qty: 12, percent: 12 },
        { rank: 5, name: "Nước chanh đào", qty: 10, percent: 10 }
    ]

    const recentOrders = [
        { id: "#2451", customer: "Nguyễn Văn A", amount: "125K", status: "completed", time: "2m" },
        { id: "#2450", customer: "Trần Thị B", amount: "180K", status: "pending", time: "5m" },
        { id: "#2449", customer: "Lê Văn C", amount: "95K", status: "completed", time: "8m" },
        { id: "#2448", customer: "Phạm Thị D", amount: "210K", status: "pending", time: "12m" }
    ]

    const quickStats = [
        { label: "Thời gian trung bình", value: "28 phút", change: "-8%" },
        { label: "Đánh giá", value: "4.8/5", change: "+0.1" },
        { label: "Tài xế hoạt động", value: "12", change: "+6%" }
    ]

    // Chart calculations
    const revenueMax = Math.max(...revenueData.map(d => d.revenue))
    const orderDonutTotal = orderStatus.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-strong">Tổng quan</h1>
                    <p className="mt-1 text-sm text-text-secondary">Chào mừng! Đây là những gì xảy ra với nhà hàng của bạn hôm nay.</p>
                </div>
                <Badge tone="neutral">30 ngày gần đây</Badge>
            </div>

            {/* KPI Cards */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </section>

            {/* Analytics Section */}
            <section className="grid gap-4 lg:grid-cols-3">
                {/* Revenue Bar Chart */}
                <div className="rounded-xl border border-border-default bg-background-surface p-6 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between border-b border-border-default pb-4">
                        <div>
                            <h2 className="font-semibold text-text-strong">Doanh thu</h2>
                            <p className="mt-1 text-sm text-text-secondary">Thống kê 7 ngày gần đây</p>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" aria-pressed="true" className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white">7D</button>
                            <button type="button" aria-pressed="false" className="rounded-lg border border-border-default px-3 py-1 text-xs font-medium transition-colors hover:bg-background-surface-hover">30D</button>
                            <button type="button" aria-pressed="false" className="rounded-lg border border-border-default px-3 py-1 text-xs font-medium transition-colors hover:bg-background-surface-hover">90D</button>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex h-56 items-end justify-around gap-1.5">
                        {revenueData.map((item, idx) => (
                            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                                <div className="flex w-full flex-col items-center">
                                    <div
                                        className="w-full rounded-t-sm bg-primary/80 transition-colors hover:bg-primary"
                                        style={{ height: `${(item.revenue / revenueMax) * 100}%`, minHeight: "4px" }}
                                        title={`${item.revenue}M₫`}
                                    />
                                </div>
                                <span className="text-xs font-medium text-text-secondary">{item.date}</span>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 text-sm text-text-secondary">
                        Giá trị theo triệu đồng
                    </div>
                </div>

                {/* Order Status Donut */}
                <div className="rounded-xl border border-border-default bg-background-surface p-6">
                    <h2 className="font-semibold text-text-strong mb-6">Trạng thái đơn</h2>

                    {/* SVG Donut Chart */}
                    <svg viewBox="0 0 200 200" className="w-full h-40 mx-auto mb-6">
                        {orderStatus.map((item, idx) => {
                            const totalValue = orderDonutTotal
                            const prevSum = orderStatus.slice(0, idx).reduce((sum, i) => sum + i.value, 0)
                            const percentage = item.value / totalValue
                            const angle = percentage * 360
                            const startAngle = (prevSum / totalValue) * 360
                            const startRad = (startAngle * Math.PI) / 180
                            const endRad = ((startAngle + angle) * Math.PI) / 180
                            const r = 60
                            const cx = 100
                            const cy = 100

                            const x1 = cx + r * Math.cos(startRad)
                            const y1 = cy + r * Math.sin(startRad)
                            const x2 = cx + r * Math.cos(endRad)
                            const y2 = cy + r * Math.sin(endRad)
                            const largeArc = angle > 180 ? 1 : 0

                            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
                            const colorClass = item.color === "primary" ? "fill-primary" : item.color === "status-warning" ? "fill-status-warning" : "fill-status-error"

                            return (
                                <path key={`donut-${idx}`} d={pathData} className={colorClass} opacity="0.9" />
                            )
                        })}
                    </svg>

                    {/* Donut Legend */}
                    <div className="space-y-2.5">
                        {orderStatus.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`size-2.5 rounded-full ${item.color === "primary" ? "bg-primary" : item.color === "status-warning" ? "bg-status-warning" : "bg-status-error"}`} aria-hidden="true" />
                                    <span className="text-text-secondary">{item.label}</span>
                                </div>
                                <span className="font-semibold tabular-nums text-text-strong">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom Section */}
            <section className="grid gap-4 lg:grid-cols-3">
                {/* Top Selling Items */}
                <div className="rounded-xl border border-border-default bg-background-surface p-5 lg:p-6">
                    <div className="mb-5 border-b border-border-default pb-3">
                        <h2 className="font-semibold text-text-strong">Món bán chạy</h2>
                        <p className="mt-1 text-sm text-text-secondary">Top bán hôm nay</p>
                    </div>

                    <div className="space-y-4">
                        {topItems.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                                    {item.rank}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-text-strong">{item.name}</p>
                                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background-surface-hover">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm font-semibold tabular-nums text-text-strong">{item.qty}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-xl border border-border-default bg-background-surface p-5 lg:p-6">
                    <div className="mb-5 border-b border-border-default pb-3">
                        <h2 className="font-semibold text-text-strong">Đơn hàng gần đây</h2>
                        <p className="mt-1 text-sm text-text-secondary">4 đơn gần đây</p>
                    </div>

                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="border-b border-border-default pb-3 last:border-0 last:pb-0">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <span className="font-mono text-sm font-medium text-text-strong">{order.id}</span>
                                    <Badge tone={order.status === "completed" ? "success" : "warning"}>
                                        {order.status === "completed" ? "Hoàn thành" : "Chờ giao"}
                                    </Badge>
                                </div>
                                <p className="mb-1 text-xs text-text-secondary">{order.customer}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold tabular-nums text-text-strong">{order.amount}</span>
                                    <span className="text-xs text-text-secondary">{order.time} trước</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-xl border border-border-default bg-background-surface p-5 lg:p-6">
                    <h2 className="mb-5 font-semibold text-text-strong">Thống kê nhanh</h2>
                    <div className="space-y-5">
                        {quickStats.map((stat) => (
                            <div key={stat.label}>
                                <p className="mb-2 text-xs text-text-secondary">{stat.label}</p>
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-2xl font-bold tabular-nums text-text-strong">{stat.value}</span>
                                    <span className={`text-xs font-medium tabular-nums ${stat.change.startsWith("+") ? "text-status-success" : "text-status-error"}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default RestaurantOverviewPage
