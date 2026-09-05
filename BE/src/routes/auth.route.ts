import { Router } from "express";
import { registerAPI, verifyOtpAPI } from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerAPI)
router.post("/verify-otp", verifyOtpAPI)

export default router;