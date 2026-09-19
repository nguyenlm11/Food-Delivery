import { Router } from "express";
import { createMenusAPI, getMenuByIdAPI } from "../controllers/menu.controller";

const router = Router()

router.post("/restaurants/:id/menus", createMenusAPI)

router.get("/menus/:id", getMenuByIdAPI)

// router.patch("/menus/:id", checkValidJWT, updateMenuAPI)

// router.delete("/menus/:id", checkValidJWT, deleteMenuAPI)

export default router