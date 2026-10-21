import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { getCartItemByIdAPI, removeCartItemAPI } from "../controllers/cart.controller"

const router = Router()

router.get("/carts/item/:itemId", checkValidJWT, getCartItemByIdAPI)

// router.patch("/carts/items/:itemId", checkValidJWT, updateCartItemAPI)

router.delete("/carts/item/:itemId", checkValidJWT, checkRole("CUSTOMER"), removeCartItemAPI)

export default router