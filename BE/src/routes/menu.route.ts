import { Router } from "express";
import { deleteMenuAPI, getMenuByIdAPI, updateMenuAPI } from "../controllers/menu.controller";

const router = Router()

router.get("/menus/:id", getMenuByIdAPI)
// router.get("/menus/:id/foods", getFoodsByMenuAPI)

router.patch("/menus", updateMenuAPI)

router.delete("/menus", deleteMenuAPI)

export default router