import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, updateRestaurantStatusAPI } from "../controllers/restaurant.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { createMenusAPI, getMyRestaurantMenusAPI } from "../controllers/menu.controller"
import { createFoodAPI, getFoodsByRestaurantAPI } from "../controllers/food.controller"
import { addCartItemAPI, getCartAPI } from "../controllers/cart.controller"

const router = Router()

router.post("/restaurants", checkValidJWT, createRestaurantAPI)
router.post("/restaurants/:id/menus", createMenusAPI)
router.post("/restaurant/resubmit", resubmitRestaurantApprovalAPI)
router.post("/restaurants/:id/foods", createFoodAPI)
router.post("/restaurants/:id/cart", checkValidJWT, addCartItemAPI)

router.get("/restaurants", getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, getMyRestaurantsAPI)
router.get("/restaurants/:id", getRestaurantByIdAPI)
router.get("/restaurants/:id/menus", getMyRestaurantMenusAPI)
router.get("/restaurants/:id/foods", getFoodsByRestaurantAPI)
router.get("/restaurants/:id/cart", checkValidJWT, getCartAPI)

// router.patch("/restaurants/:id", checkValidJWT, updateRestaurantAPI)
router.patch("/restaurants/approve", approveRestaurantAPI)
router.patch("/restaurants/reject", rejectRestaurantAPI)
router.patch("/restaurants/status", updateRestaurantStatusAPI)

router.delete("/restaurants", deleteRestaurantAPI)

export default router