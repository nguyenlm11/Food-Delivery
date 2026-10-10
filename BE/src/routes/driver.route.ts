import { Router } from "express"
import { getAllDriversAPI } from "../controllers/driver.controller"
import { createDriverAPI } from "../controllers/driver.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/drivers", checkValidJWT, checkRole("ADMIN"), createDriverAPI)

router.get("/drivers", checkValidJWT, checkRole("ADMIN"), getAllDriversAPI)

export default router