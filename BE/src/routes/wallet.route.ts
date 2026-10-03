import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { getWalletAPI, getWalletTransactionsAPI, retryTopUpWalletAPI, topUpWalletAPI, vnpayReturnAPI } from "../controllers/wallet.controller"

const router = Router()

router.post("/wallets/top-up", checkValidJWT, topUpWalletAPI)
router.post("/wallets/top-up/:transactionId/retry", checkValidJWT, retryTopUpWalletAPI)

router.get("/wallet/vnpay/return", vnpayReturnAPI)
router.get("/wallets/me", checkValidJWT, getWalletAPI)
router.get("/wallet/transactions", checkValidJWT, getWalletTransactionsAPI)

export default router