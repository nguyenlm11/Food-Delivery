import { Router } from "express";
import { forgetPasswordAPI, registerAPI, resendOtpAPI, resetPasswordAPI, verifyOtpAPI } from "../controllers/auth.controller";

const router = Router();

// router.post("/login", loginAPI)
router.post("/register", registerAPI)
router.post("/verify-otp", verifyOtpAPI)
router.post("/resend-otp", resendOtpAPI)
router.post("/forget-password", forgetPasswordAPI)
router.post("/reset-password", resetPasswordAPI)

export default router;