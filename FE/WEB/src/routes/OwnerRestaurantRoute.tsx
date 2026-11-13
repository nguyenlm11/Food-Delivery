import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import ResultDialog from "@/components/ResultDialog"
import { getMyRestaurants } from "@/services/restaurant.service"
import { extractRestaurantId } from "@/utils/restaurantPath"

const OwnerRestaurantRoute = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const restaurantId = extractRestaurantId(location.pathname)
    const [isChecking, setIsChecking] = useState(true)
    const [result, setResult] = useState({ isOpen: false, isSuccess: false, message: "" })

    useEffect(() => {
        setIsChecking(true)
        setResult({ isOpen: false, isSuccess: false, message: "" })

        const checkRestaurantAccess = async () => {
            try {
                const response = await getMyRestaurants()
                const restaurants = response?.data ?? []
                const isOwned = restaurants.some((item: any) => item._id === restaurantId)

                if (!isOwned) {
                    setResult({
                        isOpen: true,
                        isSuccess: false,
                        message: "Bạn không có quyền truy cập nhà hàng này hoặc nhà hàng không tồn tại.",
                    })
                }
            }
            catch {
                setResult({
                    isOpen: true,
                    isSuccess: false,
                    message: "Không thể tải danh sách nhà hàng. Vui lòng thử lại.",
                })
            }
            finally {
                setIsChecking(false)
            }
        }

        checkRestaurantAccess()
    }, [restaurantId])

    if (isChecking) {
        return null
    }

    if (result.isOpen) {
        return (
            <ResultDialog
                open={result.isOpen}
                onOpenChange={() => navigate("/owner/restaurants", { replace: true })}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        )
    }

    return <Outlet />
}

export default OwnerRestaurantRoute
