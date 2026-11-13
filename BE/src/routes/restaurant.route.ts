import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, restoreRestaurantAPI, resubmitRestaurantApprovalAPI, updateImageRestaurantAPI, updateRestaurantAPI, updateRestaurantStatusAPI } from "../controllers/restaurant.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { createMenusAPI, getRestaurantMenusAPI } from "../controllers/menu.controller"
import { createFoodAPI, getFoodsByRestaurantAPI } from "../controllers/food.controller"
import { addCartItemAPI, clearCartAPI, getCartAPI } from "../controllers/cart.controller"
import { createModifierGroupAPI, getRestaurantModifierGroupsAPI } from "../controllers/modifier.controller"
import { calculateShipFeeAPI } from "../controllers/shipfee.controller"

const router = Router()

router.post("/restaurants", checkValidJWT, checkRole("OWNER"), createRestaurantAPI)
router.post("/restaurants/me/resubmit", checkValidJWT, checkRole("OWNER"), resubmitRestaurantApprovalAPI)
router.post("/restaurants/:restaurantId/menus", checkValidJWT, checkRole("OWNER"), createMenusAPI)
router.post("/restaurants/:restaurantId/modifier-groups", checkValidJWT, checkRole("OWNER"), createModifierGroupAPI)
router.post("/restaurants/:restaurantId/foods", checkValidJWT, checkRole("OWNER"), createFoodAPI)
router.post("/restaurants/:restaurantId/cart", checkValidJWT, checkRole("CUSTOMER"), addCartItemAPI)
router.get("/restaurants/:restaurantId/ship-fee", checkValidJWT, calculateShipFeeAPI)

router.get("/restaurants", checkValidJWT, getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, checkRole("OWNER"), getMyRestaurantsAPI)
router.get("/restaurants/:restaurantId", checkValidJWT, getRestaurantByIdAPI)
router.get("/restaurants/:restaurantId/menus", checkValidJWT, getRestaurantMenusAPI)
router.get("/restaurants/:restaurantId/modifier-groups", checkValidJWT, checkRole("OWNER", "RESTAURANT"), getRestaurantModifierGroupsAPI)
router.get("/restaurants/:restaurantId/foods", checkValidJWT, getFoodsByRestaurantAPI)
router.get("/restaurants/:restaurantId/cart", checkValidJWT, checkRole("CUSTOMER"), checkValidJWT, getCartAPI)

router.patch("/restaurants/:restaurantId/approve", checkValidJWT, checkRole("ADMIN"), approveRestaurantAPI)
router.patch("/restaurants/:restaurantId/reject", checkValidJWT, checkRole("ADMIN"), rejectRestaurantAPI)
router.patch("/restaurants/:restaurantId/status", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), updateRestaurantStatusAPI)
router.patch("/restaurants/:restaurantId/restore", checkValidJWT, checkRole("ADMIN", "OWNER"), restoreRestaurantAPI)
router.patch("/restaurants/:restaurantId", checkValidJWT, checkRole("OWNER"), updateRestaurantAPI)
router.patch("/restaurants/:restaurantId/image", checkValidJWT, checkRole("OWNER"), updateImageRestaurantAPI)

router.delete("/restaurants/:restaurantId", checkValidJWT, checkRole("OWNER"), deleteRestaurantAPI)
router.delete("/restaurants/:restaurantId/cart", checkValidJWT, checkRole("CUSTOMER"), clearCartAPI)


export default router
