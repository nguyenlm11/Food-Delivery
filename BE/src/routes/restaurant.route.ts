import { Router } from "express"
import { approveRestaurantAPI, createRestaurantAPI, deleteRestaurantAPI, getAllRestaurantsAPI, getMyRestaurantsAPI, getRestaurantByIdAPI, rejectRestaurantAPI, resubmitRestaurantApprovalAPI, restoreRestaurantAPI, updateImageRestaurantAPI, updateRestaurantAPI, updateRestaurantStatusAPI } from "../controllers/restaurant.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/restaurants", checkValidJWT, checkRole("OWNER"), createRestaurantAPI)

router.get("/restaurants", checkValidJWT, getAllRestaurantsAPI)
router.get("/restaurants/me", checkValidJWT, checkRole("OWNER"), getMyRestaurantsAPI)
router.get("/restaurants/:restaurantId", checkValidJWT, getRestaurantByIdAPI)

router.patch("/restaurants/:restaurantId", checkValidJWT, checkRole("OWNER"), updateRestaurantAPI)
router.patch("/restaurants/:restaurantId/image", checkValidJWT, checkRole("OWNER"), updateImageRestaurantAPI)
router.patch("/restaurants/:restaurantId/status", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), updateRestaurantStatusAPI)
router.post("/restaurants/:restaurantId/restore", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), restoreRestaurantAPI)

router.post("/restaurants/:restaurantId/approve", checkValidJWT, checkRole("ADMIN"), approveRestaurantAPI)
router.post("/restaurants/:restaurantId/reject", checkValidJWT, checkRole("ADMIN"), rejectRestaurantAPI)
router.post("/restaurants/me/resubmit", checkValidJWT, checkRole("OWNER"), resubmitRestaurantApprovalAPI)

router.delete("/restaurants/:restaurantId", checkValidJWT, checkRole("ADMIN", "OWNER"), deleteRestaurantAPI)

export default router
