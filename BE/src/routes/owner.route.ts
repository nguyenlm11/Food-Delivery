import { Router } from "express"
import { getAllOwnersAPI, getMyOwnerAPI, getOwnersByIdAPI } from "../controllers/owner.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/owners", getAllOwnersAPI)
router.get("/owners/me", checkValidJWT, getMyOwnerAPI)
router.get("/owners/:id", getOwnersByIdAPI)

// router.patch("/owners/me", checkValidJWT, updateMyOwnerAPI)
// router.patch("/owners/me/citizen-images", checkValidJWT, updateCitizenImagesAPI)
// router.patch("/owners/:id/approve", checkValidJWT, approveOwnerAPI)
// router.patch("/owners/:id/reject", checkValidJWT, rejectOwnerAPI)

// router.delete("/owners/me", checkValidJWT, deleteMyOwnerAPI)

export default router