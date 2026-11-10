import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { createVoucherAPI, deleteVoucherAPI, getAllVouchersAPI, restoreVoucherAPI, updateVoucherAPI, updateVoucherStatusAPI } from "../controllers/voucher.controller"

const router = Router()

router.post("/vouchers", checkValidJWT, checkRole("ADMIN", "OWNER"), createVoucherAPI)

router.get("/vouchers", checkValidJWT, checkRole("ADMIN", "OWNER"), getAllVouchersAPI)
// router.get("/voucher", checkValidJWT, checkRole("ADMIN", "OWNER"), getVouchersByRestaurantIdAPI)

router.patch("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherAPI)
router.patch("/vouchers/:voucherId/status", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherStatusAPI)
router.patch("/vouchers/:voucherId/restore", checkValidJWT, checkRole("ADMIN", "OWNER"), restoreVoucherAPI)

router.delete("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteVoucherAPI)

export default router
