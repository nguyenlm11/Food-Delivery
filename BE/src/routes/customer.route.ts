import { Router } from "express"
import { getAllCustomersAPI, getCustomerByIdAPI, deleteCustomerByIdAPI, getMyCustomerAPI, updateMyCustomerAPI } from "../controllers/customer.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/customers", getAllCustomersAPI)
router.get("/customers/me", checkValidJWT, getMyCustomerAPI)
router.get("/customers/:id", getCustomerByIdAPI)

router.patch("/customers/me", checkValidJWT, updateMyCustomerAPI)

router.delete("/customers/:id", deleteCustomerByIdAPI)

export default router