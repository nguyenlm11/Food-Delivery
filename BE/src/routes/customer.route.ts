import { Router } from "express"
import { getAllCustomersAPI, getCustomerByIdAPI, deleteCustomerByIdAPI, updateMyCustomerAPI } from "../controllers/customer.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/customers", checkValidJWT, checkRole("ADMIN"), getAllCustomersAPI)
router.get("/customers/:customerId", checkValidJWT, getCustomerByIdAPI)

router.patch("/customers/me", checkValidJWT, checkRole("CUSTOMER"), updateMyCustomerAPI)

router.delete("/customers/:customerId", checkValidJWT, checkRole("ADMIN"), deleteCustomerByIdAPI)

export default router