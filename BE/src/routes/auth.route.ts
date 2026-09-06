import { Router } from "express";
import { registerAPI, resendOtpAPI, verifyOtpAPI } from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerAPI)
router.post("/verify-otp", verifyOtpAPI)
router.post("/resend-otp", resendOtpAPI)

export default router;