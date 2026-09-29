import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { removeCartItemAPI } from "../controllers/cart.controller"

const router = Router()

// router.patch("/carts/items/:itemId", checkValidJWT, updateCartItemAPI)

router.delete("/carts/item/:itemId", checkValidJWT, removeCartItemAPI)

export default router