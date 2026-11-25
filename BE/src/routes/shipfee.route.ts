import { Router } from "express"
import { calculateShipFeeAPI, createShipFeeAPI, deleteShipFeeAPI, getAllShipFeesAPI, getShipFeeByIdAPI, restoreShipFeeAPI, updateShipFeeAPI, updateShipFeeStatusAPI } from "../controllers/shipfee.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/ship-fees", checkValidJWT, checkRole("ADMIN"), createShipFeeAPI)

router.get("/ship-fees", checkValidJWT, checkRole("ADMIN"), getAllShipFeesAPI)
router.get("/ship-fees/calculate", checkValidJWT, calculateShipFeeAPI)
router.get("/ship-fees/:shipFeeId", checkValidJWT, checkRole("ADMIN"), getShipFeeByIdAPI)

router.patch("/ship-fees/:shipFeeId", checkValidJWT, checkRole("ADMIN"), updateShipFeeAPI)
router.patch("/ship-fees/:shipFeeId/status", checkValidJWT, checkRole("ADMIN"), updateShipFeeStatusAPI)
router.post("/ship-fees/:shipFeeId/restore", checkValidJWT, checkRole("ADMIN"), restoreShipFeeAPI)

router.delete("/ship-fees/:shipFeeId", checkValidJWT, checkRole("ADMIN"), deleteShipFeeAPI)

export default router
