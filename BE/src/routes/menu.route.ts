import { Router } from "express"
import { deleteMenuAPI, getMenuByIdAPI, updateMenuAPI } from "../controllers/menu.controller"
import { getFoodsByMenuAPI } from "../controllers/food.controller"

const router = Router()

router.get("/menus/:menuId", getMenuByIdAPI)
router.get("/menus/:menuId/foods", getFoodsByMenuAPI)

router.patch("/menus/:menuId", updateMenuAPI)

router.delete("/menus/:menuId", deleteMenuAPI)

export default router