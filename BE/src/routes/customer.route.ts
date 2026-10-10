import { Router } from "express"
import { getAllCustomersAPI, getCustomerByIdAPI, deleteCustomerByIdAPI, updateMyCustomerAPI } from "../controllers/customer.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/customers", getAllCustomersAPI)
router.get("/customers/:customerId", getCustomerByIdAPI)

router.patch("/customers/me", checkValidJWT, updateMyCustomerAPI)

router.delete("/customers/:customerId", deleteCustomerByIdAPI)

export default router