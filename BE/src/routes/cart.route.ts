import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { removeCartItemAPI } from "../controllers/cart.controller"

const router = Router()

// router.patch("/carts/items/:id", checkValidJWT, updateCartItemAPI)

router.delete("/carts/item/:id", checkValidJWT, removeCartItemAPI)
// router.delete("/restaurants/:restaurantId/cart", checkValidJWT, clearCartAPI)

export default router