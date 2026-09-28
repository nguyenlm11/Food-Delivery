import { Router } from "express"

import {
    createCategoryAPI,
    deleteCategoryAPI,
    getAllCategoriesAPI,
    getCategoryByIdAPI,
    restoreCategoryAPI
} from "../controllers/category.controller"

const router = Router()

router.post("/categories", createCategoryAPI)

router.get("/categories", getAllCategoriesAPI)
router.get("/categories/:categoryId", getCategoryByIdAPI)

router.patch("/categories/:categoryId/restore", restoreCategoryAPI)
// router.patch("/categories/:id", updateCategoryAPI) 

router.delete("/categories/:categoryId", deleteCategoryAPI)

export default router