import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import ResultDialog from "@/components/common/ResultDialog"
import { getMyRestaurants } from "@/services/restaurant.service"
import { extractRestaurantId } from "@/utils/restaurantPath"

const OwnerRestaurantRoute = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const restaurantId = extractRestaurantId(location.pathname)
    const [result, setResult] = useState({ restaurantId: "", isOpen: false, isSuccess: false, message: "" })

    useEffect(() => {
        let isActive = true

        const checkRestaurantAccess = async () => {
            let update = { isOpen: false, isSuccess: false, message: "" }

            try {
                const response = await getMyRestaurants()
                const restaurants = response?.data ?? []
                const isOwned = restaurants.some((item: any) => item._id === restaurantId)

                if (!isOwned) {
                    update = {
                        isOpen: true,
                        isSuccess: false,
                        message: "Bạn không có quyền truy cập nhà hàng này hoặc nhà hàng không tồn tại.",
                    }
                }
            }
            catch {
                update = {
                    isOpen: true,
                    isSuccess: false,
                    message: "Không thể tải danh sách nhà hàng. Vui lòng thử lại.",
                }
            }

            if (!isActive) { return }
            setResult({ restaurantId, ...update })
        }

        checkRestaurantAccess()

        return () => {
            isActive = false
        }
    }, [restaurantId])

    if (result.restaurantId !== restaurantId) {
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
