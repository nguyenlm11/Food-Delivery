import { Router } from "express"

import { getFoodByIdAPI, updateFoodAPI, updateFoodStatusAPI } from "../controllers/food.controller"

const router = Router()

router.get("/foods/:foodId", getFoodByIdAPI)

router.patch("/foods/:foodId", updateFoodAPI)

router.patch("/foods/:foodId/status", updateFoodStatusAPI)

// router.delete("/foods", checkValidJWT, deleteFoodAPI) 
export default router