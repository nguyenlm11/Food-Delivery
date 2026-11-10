import { Router } from "express"

import { deleteFoodAPI, getFoodByIdAPI, restoreFoodAPI, updateFoodAPI, updateFoodStatusAPI } from "../controllers/food.controller"
import { attachModifierGroupToFoodAPI } from "../controllers/modifier.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/foods/:foodId/modifier-groups", checkValidJWT, checkRole("OWNER"), attachModifierGroupToFoodAPI)

router.get("/foods/:foodId", checkValidJWT, getFoodByIdAPI)

router.patch("/foods/:foodId", checkValidJWT, checkRole("OWNER"), updateFoodAPI)
router.patch("/foods/:foodId/status", checkValidJWT, checkRole("OWNER", "RESTAURANT"), updateFoodStatusAPI)
router.patch("/foods/:foodId/restore", checkValidJWT, checkRole("OWNER"), restoreFoodAPI)

router.delete("/foods/:foodId", checkValidJWT, checkRole("OWNER"), deleteFoodAPI)

export default router
