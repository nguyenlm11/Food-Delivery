import { Router } from "express"
import { getWalletAPI, getWalletTransactionsAPI, retryTopUpWalletAPI, topUpWalletAPI, vnpayReturnAPI } from "../controllers/wallet.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/wallets/top-up", checkValidJWT, checkRole("CUSTOMER"), topUpWalletAPI)
router.post("/wallets/top-up/:transactionId/retry", checkValidJWT, checkRole("CUSTOMER"), retryTopUpWalletAPI)

router.get("/wallets/me", checkValidJWT, checkRole("CUSTOMER"), getWalletAPI)
router.get("/wallets/transactions", checkValidJWT, checkRole("CUSTOMER"), getWalletTransactionsAPI)
router.get("/wallets/vnpay/return", checkValidJWT, checkRole("CUSTOMER"), vnpayReturnAPI)

export default router
