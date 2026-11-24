import { Router } from "express"
import { changePasswordAPI, customerRegisterAPI, deleteUserAPI, forgetPasswordAPI, getMeAPI, loginAPI, logoutAPI, ownerRegisterAPI, refreshTokenAPI, resendOtpAPI, resetPasswordAPI, updateUserStatusAPI, verifyOtpAPI } from "../controllers/auth.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { authRateLimit, otpRateLimit } from "../middlewares/rateLimit.middleware"

const router = Router()

router.post("/login", authRateLimit, loginAPI)
router.post("/staff-login", authRateLimit, loginAPI)
router.post("/refresh-token", refreshTokenAPI)
router.post("/customer/register", authRateLimit, customerRegisterAPI)
router.post("/owner/register", authRateLimit, ownerRegisterAPI)
router.post("/verify-otp", otpRateLimit, verifyOtpAPI)
router.post("/resend-otp", otpRateLimit, resendOtpAPI)
router.post("/forget-password", otpRateLimit, forgetPasswordAPI)
router.post("/reset-password", otpRateLimit, resetPasswordAPI)
router.post("/logout", logoutAPI)

router.get("/me", checkValidJWT, getMeAPI)

router.patch("/change-password", checkValidJWT, changePasswordAPI)
router.patch("/users/:userId/status", checkValidJWT, checkRole("ADMIN"), updateUserStatusAPI)

router.delete("/users/:userId", checkValidJWT, checkRole("ADMIN"), deleteUserAPI)

export default router
