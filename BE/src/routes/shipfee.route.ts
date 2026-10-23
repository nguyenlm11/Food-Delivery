import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

// router.post("/ship-fees", checkValidJWT, checkRole("ADMIN"), createShipFeeAPI)

// router.get("/ship-fees", checkValidJWT, checkRole("ADMIN"), getAllShipFeesAPI)

// router.patch("/ship-fees/:id", checkValidJWT, checkRole("ADMIN"), updateShipFeeAPI)
// router.patch("/ship-fees/:id/toggle", checkValidJWT, checkRole("ADMIN"), toggleShipFeeStatusAPI)

// router.delete("/ship-fees/:id", checkValidJWT, checkRole("ADMIN"), deleteShipFeeAPI)

export default router
