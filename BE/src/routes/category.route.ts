import { Router } from "express"
import { getAllCategoriesAPI } from "../controllers/category.controller"

const router = Router()
// router.post("/categories", createCategoryAPI)

router.get("/categories", getAllCategoriesAPI)
// router.get("/categories/:id", getCategoryByIdAPI)

// router.patch("/categories/:id", updateCategoryAPI)
// router.patch("/categories/:id/status", updateCategoryStatusAPI)

// router.delete("/Categories/:id", deleteCategoryAPI)

export default router