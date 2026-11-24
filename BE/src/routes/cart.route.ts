import { Router } from "express"
import { getCartItemByIdAPI, removeCartItemAPI } from "../controllers/cart.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"

const router = Router()

router.get("/carts/items/:itemId", checkValidJWT, checkActiveAccount, getCartItemByIdAPI)

router.delete("/carts/items/:itemId", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, removeCartItemAPI)

export default router
