import { Router } from "express";
import { getAllCustomersAPI, getCustomerByIdAPI, deleteCustomerByIdAPI } from "../controllers/user.controller";

const router = Router();

router.get("/customers", getAllCustomersAPI);
router.get("/customers/:id", getCustomerByIdAPI);
router.delete("/customers/:id", deleteCustomerByIdAPI);

export default router;