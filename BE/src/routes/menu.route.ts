import { Router } from "express"
import { createMenusAPI, deleteMenuAPI, getMenuByIdAPI, getMenusAPI, restoreMenuAPI, updateMenuAPI, updateMenuStatusAPI } from "../controllers/menu.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/menus", checkValidJWT, checkRole("OWNER"), createMenusAPI)

router.get("/menus", checkValidJWT, getMenusAPI)
router.get("/menus/:menuId", checkValidJWT, getMenuByIdAPI)

router.patch("/menus/:menuId", checkValidJWT, checkRole("OWNER"), updateMenuAPI)
router.patch("/menus/:menuId/status", checkValidJWT, checkRole("OWNER"), updateMenuStatusAPI)
router.post("/menus/:menuId/restore", checkValidJWT, checkRole("OWNER"), restoreMenuAPI)

router.delete("/menus/:menuId", checkValidJWT, checkRole("OWNER"), deleteMenuAPI)

export default router
