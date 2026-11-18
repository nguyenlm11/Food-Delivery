import { Router } from "express"
import { createVoucherAPI, deleteVoucherAPI, getAllVouchersAPI, updateVoucherAPI, updateVoucherStatusAPI } from "../controllers/voucher.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/vouchers", checkValidJWT, checkRole("ADMIN", "OWNER"), createVoucherAPI)

router.get("/vouchers", checkValidJWT, checkRole("ADMIN", "OWNER"), getAllVouchersAPI)
// router.get("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), getVouchersByRestaurantIdAPI)

router.patch("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherAPI)
router.patch("/vouchers/:voucherId/status", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherStatusAPI)

router.delete("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteVoucherAPI)

export default router
