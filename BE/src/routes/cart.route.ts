import { Router } from "express"
import { getCartItemByIdAPI, removeCartItemAPI } from "../controllers/cart.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/carts/items/:itemId", checkValidJWT, getCartItemByIdAPI)

router.delete("/carts/items/:itemId", checkValidJWT, checkRole("CUSTOMER"), removeCartItemAPI)

export default router
