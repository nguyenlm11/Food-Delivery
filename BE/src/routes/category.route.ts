import { Router } from "express"
import { createCategoryAPI, getAllCategoriesAPI, getCategoryByIdAPI } from "../controllers/category.controller"

const router = Router()
router.post("/categories", createCategoryAPI)

router.get("/categories", getAllCategoriesAPI)
router.get("/categories/:id", getCategoryByIdAPI)

// router.patch("/categories/:id", updateCategoryAPI)
// router.patch("/categories/:id/status", updateCategoryStatusAPI)

// router.delete("/categories/:id", deleteCategoryAPI)

export default router