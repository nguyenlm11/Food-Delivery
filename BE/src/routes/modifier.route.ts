import { Router } from "express"
import { createModifierGroupAPI, createModifierOptionAPI, deleteModifierGroupAPI, deleteModifierOptionAPI, getModifierGroupByIdAPI, getModifierGroupOptionsAPI, getModifierGroupsAPI, restoreModifierGroupAPI, restoreModifierOptionAPI, updateModifierGroupAPI, updateModifierGroupStatusAPI, updateModifierOptionAPI, updateModifierOptionStatusAPI } from "../controllers/modifier.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/modifier-groups", checkValidJWT, getModifierGroupsAPI)
router.get("/modifier-groups/:modifierGroupId", checkValidJWT, getModifierGroupByIdAPI)
router.get("/modifier-groups/:modifierGroupId/options", checkValidJWT, getModifierGroupOptionsAPI)

router.post("/modifier-groups", checkValidJWT, checkRole("OWNER"), createModifierGroupAPI)
router.post("/modifier-options", checkValidJWT, checkRole("OWNER"), createModifierOptionAPI)

router.patch("/modifier-groups/:modifierGroupId", checkValidJWT, checkRole("OWNER"), updateModifierGroupAPI)
router.patch("/modifier-groups/:modifierGroupId/status", checkValidJWT, checkRole("OWNER"), updateModifierGroupStatusAPI)
router.patch("/modifier-options/:modifierOptionId", checkValidJWT, checkRole("OWNER"), updateModifierOptionAPI)
router.patch("/modifier-options/:modifierOptionId/status", checkValidJWT, checkRole("OWNER"), updateModifierOptionStatusAPI)

router.post("/modifier-groups/:modifierGroupId/restore", checkValidJWT, checkRole("OWNER"), restoreModifierGroupAPI)
router.post("/modifier-options/:modifierOptionId/restore", checkValidJWT, checkRole("OWNER"), restoreModifierOptionAPI)

router.delete("/modifier-groups/:modifierGroupId", checkValidJWT, checkRole("OWNER"), deleteModifierGroupAPI)
router.delete("/modifier-options/:modifierOptionId", checkValidJWT, checkRole("OWNER"), deleteModifierOptionAPI)

export default router
