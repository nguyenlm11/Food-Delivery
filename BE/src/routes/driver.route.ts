import { Router } from "express"
import { getAllDriversAPI } from "../controllers/driver.controller"
//import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/drivers", getAllDriversAPI)

export default router