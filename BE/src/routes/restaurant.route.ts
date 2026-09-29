import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, updateRestaurantStatusAPI } from "../controllers/restaurant.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { createMenusAPI, getMyRestaurantMenusAPI } from "../controllers/menu.controller"
import { createFoodAPI, getFoodsByRestaurantAPI } from "../controllers/food.controller"
import { addCartItemAPI, getCartAPI } from "../controllers/cart.controller"

const router = Router()

router.post("/restaurants", checkValidJWT, createRestaurantAPI)
router.post("/restaurants/me/resubmit", checkValidJWT, resubmitRestaurantApprovalAPI)
router.post("/restaurants/:restaurantId/menus", createMenusAPI)
router.post("/restaurants/:restaurantId/foods", createFoodAPI)
router.post("/restaurants/:restaurantId/cart", checkValidJWT, addCartItemAPI)

router.get("/restaurants", getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, getMyRestaurantsAPI)
router.get("/restaurants/:restaurantId", getRestaurantByIdAPI)
router.get("/restaurants/:restaurantId/menus", getMyRestaurantMenusAPI)
router.get("/restaurants/:restaurantId/foods", getFoodsByRestaurantAPI)
router.get("/restaurants/:restaurantId/cart", checkValidJWT, getCartAPI)

router.patch("/restaurants/:restaurantId/approve", approveRestaurantAPI)
router.patch("/restaurants/:restaurantId/reject", rejectRestaurantAPI)
router.patch("/restaurants/:restaurantId/status", updateRestaurantStatusAPI)
// router.patch("/restaurants/:id", checkValidJWT, updateRestaurantAPI) 

router.delete("/restaurants/:restaurantId", deleteRestaurantAPI)
// router.delete("/restaurants/:restaurantId/cart", checkValidJWT, clearCartAPI)


export default router