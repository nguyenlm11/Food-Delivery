import { Router } from "express"

import { deleteModifierGroupAPI, deleteModifierOptionAPI, restoreModifierGroupAPI, restoreModifierOptionAPI, updateModifierGroupStatusAPI, updateModifierOptionStatusAPI } from "../controllers/modifier.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.patch("/modifier-groups/:modifierGroupId/status", checkValidJWT, checkRole("OWNER"), updateModifierGroupStatusAPI)
router.patch("/modifier-groups/:modifierGroupId/restore", checkValidJWT, checkRole("OWNER"), restoreModifierGroupAPI)

router.delete("/modifier-groups/:modifierGroupId", checkValidJWT, checkRole("OWNER"), deleteModifierGroupAPI)

router.patch("/modifier-options/:modifierOptionId/status", checkValidJWT, checkRole("OWNER"), updateModifierOptionStatusAPI)
router.patch("/modifier-options/:modifierOptionId/restore", checkValidJWT, checkRole("OWNER"), restoreModifierOptionAPI)

router.delete("/modifier-options/:modifierOptionId", checkValidJWT, checkRole("OWNER"), deleteModifierOptionAPI)

export default router
