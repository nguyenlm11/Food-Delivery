import { Router } from "express"
import { createVoucherAPI, deleteVoucherAPI, getAllVouchersAPI, getVoucherByIdAPI, restoreVoucherAPI, updateVoucherAPI, updateVoucherStatusAPI } from "../controllers/voucher.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/vouchers", checkValidJWT, checkRole("ADMIN", "OWNER"), createVoucherAPI)

router.get("/vouchers", checkValidJWT, checkRole("ADMIN", "OWNER"), getAllVouchersAPI)
router.get("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), getVoucherByIdAPI)

router.patch("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherAPI)
router.patch("/vouchers/:voucherId/status", checkValidJWT, checkRole("ADMIN", "OWNER"), updateVoucherStatusAPI)
router.post("/vouchers/:voucherId/restore", checkValidJWT, checkRole("ADMIN", "OWNER"), restoreVoucherAPI)

router.delete("/vouchers/:voucherId", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteVoucherAPI)

export default router
