import { Router } from "express"
import { getAllCustomersAPI, getCustomerByIdAPI, updateMyCustomerAPI } from "../controllers/customer.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"

const router = Router()

router.get("/customers", checkValidJWT, checkRole("ADMIN"), getAllCustomersAPI)
router.get("/customers/:customerId", checkValidJWT, checkRole("ADMIN"), getCustomerByIdAPI)

router.patch("/customers/me", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, updateMyCustomerAPI)

export default router
