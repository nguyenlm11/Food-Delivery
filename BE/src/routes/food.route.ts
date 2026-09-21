import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { getFoodByIdAPI, getFoodsByRestaurantAPI } from "../controllers/food.controller"

const router = Router()

router.get("/foods/:id", getFoodByIdAPI)
router.get("/restaurants/:id/foods", getFoodsByRestaurantAPI)

// router.patch("/foods/:id", checkValidJWT, updateFoodAPI)

// router.delete("/foods/:id", checkValidJWT, deleteFoodAPI)

export default router