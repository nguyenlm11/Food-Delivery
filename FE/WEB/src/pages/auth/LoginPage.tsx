import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../../components/ui/card"

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            await login({ email, password })
            navigate("/hello")
        }
        catch (error: any) {
            setError(error.response?.data?.message)
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        Đăng nhập
                    </CardTitle>
                    <CardDescription>
                        Nhập email và mật khẩu để đăng nhập vào hệ thống.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Mật khẩu
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginPage