import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"
import { createOrderAPI, quoteOrderAPI, getOrderByIdAPI, getAllOrdersAPI, getMyOrdersAPI } from "../controllers/order.controller"

const router = Router()

router.post("/orders", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, createOrderAPI)

router.get("/orders/quote", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, quoteOrderAPI)

// router.get("/orders/driver", checkValidJWT, checkRole("DRIVER"), getDriverOrdersAPI)
router.get("/orders", checkValidJWT, checkRole("ADMIN", "OWNER"), getAllOrdersAPI)
router.get("/orders/me", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, getMyOrdersAPI)
router.get("/orders/:orderId", checkValidJWT, checkRole("CUSTOMER", "OWNER", "DRIVER", "ADMIN"), getOrderByIdAPI)

export default router
