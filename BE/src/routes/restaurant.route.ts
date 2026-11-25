import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, restoreRestaurantAPI, updateImageRestaurantAPI, updateRestaurantAPI, updateRestaurantStatusAPI } from "../controllers/restaurant.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { addCartItemAPI, clearCartAPI, getCartAPI } from "../controllers/cart.controller"
import { calculateShipFeeAPI } from "../controllers/shipfee.controller"
import { checkActiveAccount } from "../middlewares/account.middleware"

const router = Router()

router.post("/restaurants", checkValidJWT, checkRole("OWNER"), createRestaurantAPI)

router.get("/restaurants", checkValidJWT, getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, checkRole("OWNER"), getMyRestaurantsAPI)
router.get("/restaurants/:restaurantId", checkValidJWT, getRestaurantByIdAPI)
router.get("/restaurants/:restaurantId/carts", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, getCartAPI)
router.get("/restaurants/:restaurantId/ship-fee", checkValidJWT, calculateShipFeeAPI)

router.patch("/restaurants/:restaurantId", checkValidJWT, checkRole("OWNER"), updateRestaurantAPI)
router.patch("/restaurants/:restaurantId/image", checkValidJWT, checkRole("OWNER"), updateImageRestaurantAPI)
router.patch("/restaurants/:restaurantId/status", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), updateRestaurantStatusAPI)
router.post("/restaurants/:restaurantId/restore", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), restoreRestaurantAPI)

router.post("/restaurants/:restaurantId/approve", checkValidJWT, checkRole("ADMIN"), approveRestaurantAPI)
router.post("/restaurants/:restaurantId/reject", checkValidJWT, checkRole("ADMIN"), rejectRestaurantAPI)
router.post("/restaurants/me/resubmit", checkValidJWT, checkRole("OWNER"), resubmitRestaurantApprovalAPI)

router.post("/restaurants/:restaurantId/carts", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, addCartItemAPI)

router.delete("/restaurants/:restaurantId", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteRestaurantAPI)
router.delete("/restaurants/:restaurantId/carts", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, clearCartAPI)

export default router
