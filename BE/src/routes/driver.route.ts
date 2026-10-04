import { Router } from "express"
import { getAllDriversAPI } from "../controllers/driver.controller"
import { createDriverAPI } from "../controllers/driver.controller"
//import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/drivers", createDriverAPI)

router.get("/drivers", getAllDriversAPI)

export default router