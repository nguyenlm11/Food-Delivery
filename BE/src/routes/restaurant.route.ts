import { Router } from "express"

import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, updateRestaurantStatusAPI } from "../controllers/restaurant.controller"

import { checkValidJWT } from "../middlewares/jwt.middleware"

import { createMenusAPI, getMyRestaurantMenusAPI } from "../controllers/menu.controller"

import { createFoodAPI, getFoodsByRestaurantAPI } from "../controllers/food.controller"

import { addCartItemAPI } from "../controllers/cart.controller"
const router = Router()

// RESTAURANT
router.post("/restaurants", checkValidJWT, createRestaurantAPI)

router.get("/restaurants", getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, getMyRestaurantsAPI)
router.get("/restaurants/:restaurantId", getRestaurantByIdAPI)

router.patch("/restaurants/:restaurantId/approve", approveRestaurantAPI)
router.patch("/restaurants/:restaurantId/reject", rejectRestaurantAPI)
router.patch("/restaurants/:restaurantId/status", updateRestaurantStatusAPI)
// router.patch("/restaurants/:id", checkValidJWT, updateRestaurantAPI) 

router.post("/restaurants/me/resubmit", checkValidJWT, resubmitRestaurantApprovalAPI)

router.delete("/restaurants/:restaurantId", deleteRestaurantAPI)

// MENUS
router.post("/restaurants/:restaurantId/menus", createMenusAPI)
router.get("/restaurants/:restaurantId/menus", getMyRestaurantMenusAPI)

// FOODS
router.post("/restaurants/:restaurantId/foods", createFoodAPI)
router.get("/restaurants/:restaurantId/foods", getFoodsByRestaurantAPI)

// CART
router.post("/restaurants/:id/cart", checkValidJWT, addCartItemAPI)
//router.get("/restaurants/:id/cart", checkValidJWT, getCartAPI)

export default router