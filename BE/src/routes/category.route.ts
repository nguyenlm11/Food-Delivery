import { Router } from "express"
import { createCategoryAPI, deleteCategoryAPI, getAllCategoriesAPI, getCategoryByIdAPI, updateCategoryStatusAPI } from "../controllers/category.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/categories", checkValidJWT, checkRole("ADMIN"), createCategoryAPI)

router.get("/categories", checkValidJWT, getAllCategoriesAPI)
router.get("/categories/:categoryId", checkValidJWT, getCategoryByIdAPI)

router.patch("/categories/:categoryId/status", checkValidJWT, checkRole("ADMIN"), updateCategoryStatusAPI)

router.delete("/categories/:categoryId", checkValidJWT, checkRole("ADMIN"), deleteCategoryAPI)

export default router
