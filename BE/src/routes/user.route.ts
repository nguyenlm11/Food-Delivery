import { Router } from "express";
import { getAllUsersAPI } from "../controllers/user.controller";

const router = Router();

router.get("/users", getAllUsersAPI);

export default router;