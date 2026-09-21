import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI } from "../controllers/restaurant.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { createMenusAPI, getMyRestaurantMenusAPI } from "../controllers/menu.controller"

const router = Router()

router.post("/restaurants", checkValidJWT, createRestaurantAPI)
router.post("/restaurants/:id/menus", createMenusAPI)
router.post("/restaurant/resubmit", resubmitRestaurantApprovalAPI)
// router.post("/restaurants/:restaurantId/foods", checkValidJWT, createFoodsAPI)

router.get("/restaurants", getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, getMyRestaurantsAPI)
router.get("/restaurants/:id", getRestaurantByIdAPI)
router.get("/restaurants/:id/menus", getMyRestaurantMenusAPI)
// router.get("/restaurants/:restaurantId/foods", getFoodsByRestaurantAPI)

// router.patch("/restaurants/:id", checkValidJWT, updateRestaurantAPI)
router.patch("/restaurants/approve", approveRestaurantAPI)
router.patch("/restaurants/reject", rejectRestaurantAPI)
// router.patch("/restaurants/status", updateRestaurantStatusAPI)

router.delete("/restaurants", deleteRestaurantAPI)

export default router