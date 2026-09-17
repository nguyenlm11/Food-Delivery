import { Router } from "express"
import { createRestaurantAPI } from "../controllers/restaurant.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/restaurants", checkValidJWT, createRestaurantAPI)

// router.get("/restaurants", getAllRestaurantsAPI)
// router.get("/restaurants/:id", getRestaurantByIdAPI)
// router.get("/restaurants/me", checkValidJWT, getMyRestaurantsAPI)

// router.patch("/restaurants/:id", checkValidJWT, updateRestaurantAPI)

// router.delete("/restaurants/:id", checkValidJWT, deleteRestaurantAPI)

export default router