import { Router } from "express"
import { getAllRolesAPI } from "../controllers/role.controller"

const router = Router()

router.get("/roles", getAllRolesAPI)

export default router