import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, LockKeyhole, Mail, Store } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import LoadingOverlay from "../../components/LoadingOverlay"

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            await login({ email, password })
            navigate("/")
        } catch (error: any) {
            setError(error.response?.data?.message || "Đăng nhập không thành công. Vui lòng thử lại.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="relative grid min-h-dvh grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] overflow-hidden bg-neutral-950 text-white max-[760px]:grid-cols-1 max-[760px]:overflow-y-auto">
            <img
                src="https://images.unsplash.com/photo-1718777791262-c66d11baaa3b?auto=format&fit=crop&w=2000&q=90"
                alt="Món ăn trong không gian nhà hàng"
                className="absolute inset-0 size-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-neutral-950/45" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/65 via-neutral-950/25 to-neutral-950/55" />

            <section className="relative flex min-h-dvh items-center px-8 py-8 sm:px-12 lg:px-16 max-[760px]:min-h-[220px] max-[760px]:items-end max-[760px]:px-6 max-[760px]:py-6">
                <div className="max-w-xl">
                    <div className="mb-10 flex items-center gap-3 max-[760px]:mb-6">
                        <span className="flex size-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur-md">
                            <Store className="size-5" />
                        </span>
                        <div>
                            <p className="font-semibold tracking-tight">FoodDelivery</p>
                            <p className="text-sm text-white/70">Quản lý nhà hàng và đơn hàng</p>
                        </div>
                    </div>

                    <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl xl:text-6xl max-[760px]:text-3xl">
                        Quản lý nhà hàng
                        <span className="mt-2 block text-white/65">đơn giản hơn.</span>
                    </h1>
                    <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 sm:text-base max-[760px]:hidden">
                        Theo dõi thực đơn, đơn hàng và hoạt động nhà hàng ngay trong một không gian quản lý.
                    </p>
                </div>
            </section>

            <section className="relative flex min-h-dvh items-center justify-center px-8 py-8 sm:px-10 lg:px-14 max-[760px]:min-h-0 max-[760px]:px-5 max-[760px]:py-4">
                <Card className="w-full max-w-md gap-0 rounded-3xl border border-white/20 bg-neutral-950/35 py-6 text-white shadow-2xl shadow-black/20 ring-0 backdrop-blur-2xl sm:px-2 sm:py-8">
                    <CardHeader className="space-y-2 px-7 pb-5 sm:px-9">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Chào mừng trở lại</p>
                        <CardTitle className="text-3xl font-medium tracking-tight text-white sm:text-4xl">Đăng nhập</CardTitle>
                        <p className="text-sm leading-6 text-white/65">Đăng nhập để tiếp tục công việc của bạn.</p>
                    </CardHeader>

                    <CardContent className="px-7 sm:px-9">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="email" className="text-sm text-white/65">Địa chỉ email</label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ten@nhahang.vn"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="h-10 rounded-none border-0 border-b border-white/35 bg-transparent px-0 pr-10 text-white shadow-none placeholder:text-white/35 focus-visible:border-white focus-visible:ring-0"
                                        autoComplete="email"
                                        required
                                    />
                                    <Mail className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-white/65" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="password" className="text-sm text-white/65">Mật khẩu</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Nhập mật khẩu"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="h-10 rounded-none border-0 border-b border-white/35 bg-transparent px-0 pr-10 text-white shadow-none placeholder:text-white/35 focus-visible:border-white focus-visible:ring-0"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <LockKeyhole className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-white/65" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-1 text-sm">
                                <span className="text-white/70">Quên mật khẩu?</span>
                            </div>

                            {error && (
                                <p role="alert" className="rounded-lg border border-white/20 bg-black/25 px-3 py-2 text-sm text-white">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                variant="outline"
                                className="mx-auto flex h-10 rounded-full border-white/50 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white"
                                disabled={isSubmitting}
                            >
                                <span>{isSubmitting ? "Đang đăng nhập..." : "Vào không gian quản lý"}</span>
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </form>

                        <div className="mt-4 border-t border-white/20 pt-4 text-center text-xs leading-5 text-white/60">
                            <p className="mt-2">Dành cho quản trị viên và đội ngũ nhà hàng.</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
            {isSubmitting && <LoadingOverlay message="Đang đăng nhập..." />}
        </main>
    )
}

export default LoginPage
