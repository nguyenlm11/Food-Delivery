import { Router } from "express"
import { deleteMenuAPI, getMenuByIdAPI, updateMenuAPI } from "../controllers/menu.controller"
import { getFoodsByMenuAPI } from "../controllers/food.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/menus/:menuId", checkValidJWT, getMenuByIdAPI)
router.get("/menus/:menuId/foods", checkValidJWT, getFoodsByMenuAPI)

router.patch("/menus/:menuId", checkValidJWT, checkRole("OWNER"), updateMenuAPI)

router.delete("/menus/:menuId", checkValidJWT, checkRole("OWNER"), deleteMenuAPI)

export default router