import { Router } from "express"
import { getAllCustomersAPI, getCustomerByIdAPI, updateMyCustomerAPI } from "../controllers/customer.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/customers", checkValidJWT, checkRole("ADMIN"), getAllCustomersAPI)
router.get("/customers/:customerId", checkValidJWT, checkRole("ADMIN"), getCustomerByIdAPI)

router.patch("/customers/me", checkValidJWT, checkRole("CUSTOMER"), updateMyCustomerAPI)

export default router