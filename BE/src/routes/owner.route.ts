import { Router } from "express"
import { getAllOwnersAPI, getMyOwnerAPI, getOwnersByIdAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, deleteOwnerByIdAPI, updateCitizenAPI, resubmitApprovalAPI } from "../controllers/owner.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/owners", getAllOwnersAPI)
router.get("/owners/me", checkValidJWT, getMyOwnerAPI)
router.get("/owners/:id", getOwnersByIdAPI)

router.post("/owners/me/resubmit", checkValidJWT, resubmitApprovalAPI)

router.patch("/owners/me", checkValidJWT, updateMyOwnerAPI)
router.patch("/owners/me/citizen", checkValidJWT, updateCitizenAPI)
router.patch("/owners/:id/approve", approveOwnerAPI)
router.patch("/owners/:id/reject", rejectOwnerAPI)

// router.delete("/owners/me", checkValidJWT, deleteMyOwnerAPI)
router.delete("/owners/:id", deleteOwnerByIdAPI)

export default router