import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { removeCartItemAPI } from "../controllers/cart.controller"

const router = Router()

// router.patch("/carts/items/:itemId", checkValidJWT, updateCartItemAPI)

router.delete("/carts/item/:itemId", checkValidJWT, checkRole("CUSTOMER"), removeCartItemAPI)

export default router