import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

// router.patch("/cart/items/:id", checkValidJWT, updateCartItemAPI)

// router.delete("/cart/items/:id", checkValidJWT, removeCartItemAPI)
// router.delete("/restaurants/:restaurantId/cart", checkValidJWT, clearCartAPI)

export default router