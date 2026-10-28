import { Eye, EyeOff, LockKeyhole, Mail, Utensils } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "@/components/ui/label"
import LoadingOverlay from "../../components/LoadingOverlay"
import ResultDialog from "../../components/ResultDialog"
import { useAuth } from "../../contexts/AuthContext"
import { AxiosError } from "axios"
import type { BackendErrorResponse } from "../../types/api"
import { getLocalizedErrorMessage } from "../../utils/errorDictionary"

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            await login({ email, password })
            navigate("/")
        }
        catch (error) {
            const response = (error as AxiosError<BackendErrorResponse>).response?.data
            setError(getLocalizedErrorMessage(response))
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-dvh bg-background-base text-foreground lg:grid lg:grid-cols-[3fr_2fr]">
            <section className="relative flex min-h-75 flex-col justify-between overflow-hidden bg-neutral-950 px-6 py-7 text-white sm:min-h-85 sm:px-10 lg:min-h-dvh lg:px-10 lg:py-10 xl:px-14">
                <motion.img
                    src="https://images.unsplash.com/photo-1718777791262-c66d11baaa3b?auto=format&fit=crop&w=2000&q=85"
                    className="absolute inset-0 size-full object-cover object-center"
                    initial={{ scale: 1.08, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/35" />

                <motion.div
                    className="relative flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
                >
                    <span className="flex size-10 items-center justify-center rounded-xl border border-white/35 bg-white/10">
                        <Utensils className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-semibold tracking-tight">Foodie</p>
                        <p className="text-sm text-white/70">Cổng quản lý nhà hàng</p>
                    </div>
                </motion.div>

                <motion.div
                    className="relative mt-8 max-w-xl lg:mt-12"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
                >
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/75">
                        Cổng đối tác Foodie
                    </p>
                    <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
                        Quản lý nhà hàng
                        <span className="block text-white/75">dễ dàng hơn.</span>
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
                        Thực đơn, cửa hàng và hoạt động kinh doanh — tất cả ở một nơi.
                    </p>
                </motion.div>
            </section>

            <section className="flex items-center justify-center bg-background-base px-6 py-12 sm:px-10 lg:min-h-dvh lg:px-12 xl:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full max-w-sm"
                >
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-medium text-text-secondary">CỔNG QUẢN LÝ FOODIE</p>
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Đăng nhập
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                            Đăng nhập để tiếp tục công việc.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value)
                                        setError("")
                                    }}
                                    autoComplete="email"
                                    required
                                    className="h-12 rounded-xl border-border-strong bg-background-surface pl-10 shadow-sm placeholder:text-muted-foreground focus-visible:border-primary-hover focus-visible:ring-primary-hover/15"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Mật khẩu
                            </Label>
                            <div className="relative">
                                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value)
                                        setError("")
                                    }}
                                    autoComplete="current-password"
                                    required
                                    className="h-12 rounded-xl border-border-strong bg-background-surface pl-10 pr-12 shadow-sm placeholder:text-muted-foreground focus-visible:border-primary-hover focus-visible:ring-primary-hover/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    aria-pressed={showPassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover"
                                >
                                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        <p className="text-right text-sm text-text-secondary">
                            <span className="text-muted-foreground">Quên mật khẩu?</span>{" "}
                        </p>

                        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                            <Button
                                type="submit"
                                className="h-12 w-full gap-2 rounded-xl text-sm font-medium"
                            >
                                Đăng nhập
                            </Button>
                        </motion.div>
                    </form>

                    <div className="mt-7 border-t border-border pt-5 text-center text-sm leading-6 text-text-secondary">
                        <p>
                            Chủ nhà hàng muốn tham gia?{" "}
                            <span className="font-semibold text-foreground">Đăng ký.</span>
                        </p>
                    </div>
                </motion.div>
            </section>

            {isSubmitting &&
                <LoadingOverlay message="Đang đăng nhập..." />
            }

            <ResultDialog
                open={Boolean(error)}
                onOpenChange={(open) => { if (!open) setError("") }}
                isSuccess={false}
                message={error}
            />
        </main>
    )
}

export default LoginPage
