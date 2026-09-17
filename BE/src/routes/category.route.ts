import { Router } from "express"
import { createCategoryAPI, deleteCategoryAPI, getAllCategoriesAPI, getCategoryByIdAPI, restoreCategoryAPI } from "../controllers/category.controller"

const router = Router()
router.post("/categories", createCategoryAPI)

router.get("/categories", getAllCategoriesAPI)
router.get("/categories/:id", getCategoryByIdAPI)

// router.patch("/categories/:id", updateCategoryAPI)
router.patch("/categories/:id/restore", restoreCategoryAPI)

router.delete("/categories/:id", deleteCategoryAPI)

export default router