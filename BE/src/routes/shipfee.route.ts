import { Router } from "express"
import { createShipFeeAPI, deleteShipFeeAPI, getAllShipFeesAPI, updateShipFeeAPI, updateShipFeeStatusAPI } from "../controllers/shipfee.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/ship-fees", checkValidJWT, checkRole("ADMIN"), createShipFeeAPI)

router.get("/ship-fees", checkValidJWT, checkRole("ADMIN"), getAllShipFeesAPI)

router.patch("/ship-fees/:shipFeeId", checkValidJWT, checkRole("ADMIN"), updateShipFeeAPI)
router.patch("/ship-fees/:shipFeeId/status", checkValidJWT, checkRole("ADMIN"), updateShipFeeStatusAPI)

router.delete("/ship-fees/:shipFeeId", checkValidJWT, checkRole("ADMIN"), deleteShipFeeAPI)

export default router
