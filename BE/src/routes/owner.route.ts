import { Router } from "express"
import { getAllOwnersAPI, getMyOwnerAPI, getOwnersByIdAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, updateCitizenAPI, resubmitApprovalAPI } from "../controllers/owner.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/owners/me/resubmit", checkValidJWT, checkRole("OWNER"), resubmitApprovalAPI)

router.get("/owners", checkValidJWT, checkRole("ADMIN"), getAllOwnersAPI)
router.get("/owners/me", checkValidJWT, checkRole("OWNER"), getMyOwnerAPI)
router.get("/owners/:ownerId", checkValidJWT, checkRole("ADMIN"), getOwnersByIdAPI)

router.patch("/owners/me", checkValidJWT, checkRole("OWNER"), updateMyOwnerAPI)
router.patch("/owners/me/citizen", checkValidJWT, checkRole("OWNER"), updateCitizenAPI)
router.patch("/owners/:ownerId/approve", checkValidJWT, checkRole("ADMIN"), approveOwnerAPI)
router.patch("/owners/:ownerId/reject", checkValidJWT, checkRole("ADMIN"), rejectOwnerAPI)

export default router