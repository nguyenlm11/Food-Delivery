import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { createVoucherAPI, getAllVouchersAPI } from "../controllers/voucher.controller"

const router = Router()

router.post("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), createVoucherAPI)

router.get("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), getAllVouchersAPI)
// router.get("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), getVouchersByRestaurantIdAPI)

// router.patch("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherAPI)

// router.delete("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteVoucherAPI)

export default router
