import { Router } from "express"
import { getAllOwnersAPI } from "../controllers/owner.controller"

const router = Router()

router.get("/owners", getAllOwnersAPI)

export default router