import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { createShipFeeAPI, deleteShipFeeAPI, getAllShipFeesAPI, restoreShipFeeAPI, updateShipFeeAPI, updateShipFeeStatusAPI } from "../controllers/shipfee.controller"

const router = Router()

router.post("/ship-fees", checkValidJWT, checkRole("ADMIN"), createShipFeeAPI)

router.get("/ship-fees", checkValidJWT, checkRole("ADMIN"), getAllShipFeesAPI)

router.patch("/ship-fees/:id", checkValidJWT, checkRole("ADMIN"), updateShipFeeAPI)
router.patch("/ship-fees/:id/status", checkValidJWT, checkRole("ADMIN"), updateShipFeeStatusAPI)
router.patch("/ship-fees/:id/restore", checkValidJWT, checkRole("ADMIN"), restoreShipFeeAPI)

router.delete("/ship-fees/:id", checkValidJWT, checkRole("ADMIN"), deleteShipFeeAPI)

export default router
