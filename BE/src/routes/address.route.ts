import { Router } from "express"
import { getMyAddressesAPI, createMyAddressAPI, updateMyAddressAPI, setDefaultAddressAPI, deleteMyAddressAPI } from "../controllers/address.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { checkActiveAccount } from "../middlewares/account.middleware"

const router = Router()

router.post("/addresses", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, createMyAddressAPI)

router.get("/addresses/me", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, getMyAddressesAPI)

router.patch("/addresses/:addressId", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, updateMyAddressAPI)
router.patch("/addresses/:addressId/default", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, setDefaultAddressAPI)

router.delete("/addresses/:addressId", checkValidJWT, checkRole("CUSTOMER"), checkActiveAccount, deleteMyAddressAPI)

export default router
