import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { getFoodByIdAPI, updateFoodAPI, updateFoodStatusAPI } from "../controllers/food.controller"

const router = Router()

router.get("/foods/:id", getFoodByIdAPI)

router.patch("/foods/:foodId", updateFoodAPI)
router.patch("/foods/status", updateFoodStatusAPI)

// router.delete("/foods", checkValidJWT, deleteFoodAPI)

export default router