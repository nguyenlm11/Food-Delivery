import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI } from "../controllers/restaurant.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/restaurants", checkValidJWT, createRestaurantAPI)

router.get("/restaurants", getAllRestaurantsAPI)
router.get("/restaurants/:id", getRestaurantByIdAPI)
// router.get("/restaurants/me", checkValidJWT, getMyRestaurantsAPI)

// router.patch("/restaurants/:id", checkValidJWT, updateRestaurantAPI)
router.delete("/restaurants/:id", deleteRestaurantAPI)

router.patch("/restaurants/:id/approve", approveRestaurantAPI)
router.patch("/restaurants/:id/reject", rejectRestaurantAPI)

// router.patch("/restaurants/:id/status", updateRestaurantStatusAPI)

export default router