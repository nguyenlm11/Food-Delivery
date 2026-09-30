import { Router } from "express";
import { checkValidJWT } from "../middlewares/jwt.middleware";
import { getWalletAPI } from "../controllers/wallet.controller";

const router = Router()

// router.post("/wallets/top-up", checkValidJWT, topUpWalletAPI)

router.get("/wallets/me", checkValidJWT, getWalletAPI)
// router.get("/wallets/me/transactions", checkValidJWT, getWalletTransactionsAPI)

export default router