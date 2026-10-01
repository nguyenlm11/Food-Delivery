import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { getWalletAPI, topUpWalletAPI, vnpayReturnAPI } from "../controllers/wallet.controller"

const router = Router()

router.post("/wallets/top-up", checkValidJWT, topUpWalletAPI)

router.get("/wallet/vnpay/return", vnpayReturnAPI)
router.get("/wallets/me", checkValidJWT, getWalletAPI)

export default router