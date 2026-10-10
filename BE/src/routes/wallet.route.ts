import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { getWalletAPI, getWalletTransactionsAPI, retryTopUpWalletAPI, topUpWalletAPI, vnpayReturnAPI } from "../controllers/wallet.controller"

const router = Router()

router.post("/wallets/top-up", checkValidJWT, checkRole("CUSTOMER"), topUpWalletAPI)
router.post("/wallets/top-up/:transactionId/retry", checkValidJWT, checkRole("CUSTOMER"), retryTopUpWalletAPI)

router.get("/wallet/vnpay/return", checkValidJWT, checkRole("CUSTOMER"), vnpayReturnAPI)
router.get("/wallets/me", checkValidJWT, checkRole("CUSTOMER"), getWalletAPI)
router.get("/wallet/transactions", checkValidJWT, checkRole("CUSTOMER"), getWalletTransactionsAPI)

export default router