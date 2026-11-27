import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"
import { createOrderAPI, quoteOrderAPI } from "../controllers/order.controller"

const router = Router()

router.post("/orders", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, createOrderAPI)

router.get("/orders/quote", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, quoteOrderAPI)

export default router
