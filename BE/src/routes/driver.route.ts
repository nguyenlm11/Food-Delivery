import { Router } from "express"
import { createDriverAPI, getAllDriversAPI, getDriverByIdAPI } from "../controllers/driver.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/drivers", checkValidJWT, checkRole("ADMIN"), createDriverAPI)

router.get("/drivers", checkValidJWT, checkRole("ADMIN"), getAllDriversAPI)
router.get("/drivers/:driverId", checkValidJWT, checkRole("ADMIN"), getDriverByIdAPI)

export default router
