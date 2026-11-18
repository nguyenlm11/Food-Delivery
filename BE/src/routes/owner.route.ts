import { Router } from "express"
import { getAllOwnersAPI, getMyOwnerAPI, getOwnersByIdAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, updateCitizenAPI, resubmitApprovalAPI } from "../controllers/owner.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/owners", checkValidJWT, checkRole("ADMIN"), getAllOwnersAPI)
router.get("/owners/me", checkValidJWT, checkRole("OWNER"), getMyOwnerAPI)
router.get("/owners/:ownerId", checkValidJWT, checkRole("ADMIN"), getOwnersByIdAPI)

router.patch("/owners/me", checkValidJWT, checkRole("OWNER"), updateMyOwnerAPI)
router.patch("/owners/me/citizen", checkValidJWT, checkRole("OWNER"), updateCitizenAPI)

router.post("/owners/:ownerId/approve", checkValidJWT, checkRole("ADMIN"), approveOwnerAPI)
router.post("/owners/:ownerId/reject", checkValidJWT, checkRole("ADMIN"), rejectOwnerAPI)
router.post("/owners/me/resubmit", checkValidJWT, checkRole("OWNER"), resubmitApprovalAPI)

export default router
