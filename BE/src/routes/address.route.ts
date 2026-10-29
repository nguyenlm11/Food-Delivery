import { Router } from "express";
import { getMyAddressesAPI, createMyAddressAPI, updateMyAddressAPI, setDefaultAddressAPI, deleteMyAddressAPI } from "../controllers/address.controller";
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router();

router.get("/my", checkValidJWT, checkRole("CUSTOMER"), getMyAddressesAPI);
router.post("/", checkValidJWT, checkRole("CUSTOMER"), createMyAddressAPI);
router.patch("/:addressId", checkValidJWT, checkRole("CUSTOMER"), updateMyAddressAPI);
router.patch("/:addressId/default", checkValidJWT, checkRole("CUSTOMER"), setDefaultAddressAPI);
router.delete("/:addressId", checkValidJWT, checkRole("CUSTOMER"), deleteMyAddressAPI);

export default router;
