import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { createVoucherAPI, deleteVoucherAPI, getAllVouchersAPI, updateVoucherAPI, updateVoucherStatusAPI } from "../controllers/voucher.controller"

const router = Router()

router.post("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), createVoucherAPI)

router.get("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), getAllVouchersAPI)
// router.get("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), getVouchersByRestaurantIdAPI)

router.patch("/voucher/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherAPI)
router.patch("/voucher/:voucherId/status", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherStatusAPI)

router.delete("/voucher/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteVoucherAPI)

export default router
