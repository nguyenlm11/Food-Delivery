import { Router } from "express"
import { getAllRolesAPI } from "../controllers/role.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/roles", checkValidJWT, getAllRolesAPI)

export default router