import { Router } from "express"

import { getAllOwnersAPI, getMyOwnerAPI, getOwnersByIdAPI, updateMyOwnerAPI, approveOwnerAPI, rejectOwnerAPI, deleteOwnerByIdAPI, updateCitizenAPI, resubmitApprovalAPI } from "../controllers/owner.controller"

import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/owners", getAllOwnersAPI)
router.get("/owners/me", checkValidJWT, getMyOwnerAPI)
router.get("/owners/:ownerId", getOwnersByIdAPI)

router.patch("/owners/me", checkValidJWT, updateMyOwnerAPI)
router.patch("/owners/me/citizen", checkValidJWT, updateCitizenAPI)

router.post("/owners/me/resubmit", checkValidJWT, resubmitApprovalAPI)

router.patch("/owners/:ownerId/approve", approveOwnerAPI)
router.patch("/owners/:ownerId/reject", rejectOwnerAPI)

router.delete("/owners/:ownerId", deleteOwnerByIdAPI)
// router.delete("/owners/me", checkValidJWT, deleteMyOwnerAPI) 

export default router