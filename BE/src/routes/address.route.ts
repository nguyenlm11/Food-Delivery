import { Router } from "express"
import { getMyAddressesAPI, createMyAddressAPI, updateMyAddressAPI, setDefaultAddressAPI, deleteMyAddressAPI } from "../controllers/address.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/addresses", checkValidJWT, checkRole("CUSTOMER"), createMyAddressAPI)

router.get("/addresses/me", checkValidJWT, checkRole("CUSTOMER"), getMyAddressesAPI)

router.patch("/addresses/:addressId", checkValidJWT, checkRole("CUSTOMER"), updateMyAddressAPI)
router.patch("/addresses/:addressId/default", checkValidJWT, checkRole("CUSTOMER"), setDefaultAddressAPI)

router.delete("/addresses/:addressId", checkValidJWT, checkRole("CUSTOMER"), deleteMyAddressAPI)

export default router
