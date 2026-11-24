import { Router } from "express"
import { getWalletAPI, getWalletTransactionsAPI, retryTopUpWalletAPI, topUpWalletAPI, vnpayReturnAPI } from "../controllers/wallet.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"

const router = Router()

router.post("/wallets/top-up", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, topUpWalletAPI)
router.post("/wallets/top-up/:transactionId/retry", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, retryTopUpWalletAPI)

router.get("/wallets/me", checkValidJWT, checkRole("CUSTOMER"), getWalletAPI)
router.get("/wallets/transactions", checkValidJWT, checkRole("CUSTOMER"), getWalletTransactionsAPI)
router.get("/wallets/vnpay/return", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, vnpayReturnAPI)

export default router
