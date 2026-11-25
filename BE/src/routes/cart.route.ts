import { Router } from "express"
import { addCartItemAPI, clearCartAPI, getCartAPI, getCartItemByIdAPI, removeCartItemAPI } from "../controllers/cart.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"

const router = Router()

router.post("/carts", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, addCartItemAPI)

router.get("/carts", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, getCartAPI)
router.get("/carts/items/:itemId", checkValidJWT, checkActiveAccount, getCartItemByIdAPI)

router.delete("/carts", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, clearCartAPI)
router.delete("/carts/items/:itemId", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, removeCartItemAPI)

export default router
