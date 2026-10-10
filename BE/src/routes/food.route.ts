import { Router } from "express"

import { getFoodByIdAPI, updateFoodAPI, updateFoodStatusAPI } from "../controllers/food.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/foods/:foodId", checkValidJWT, getFoodByIdAPI)

router.patch("/foods/:foodId", checkValidJWT, checkRole("OWNER"), updateFoodAPI)
router.patch("/foods/:foodId/status", checkValidJWT, checkRole("OWNER", "RESTAURANT"), updateFoodStatusAPI)

// router.delete("/foods", checkValidJWT, deleteFoodAPI) 

export default router