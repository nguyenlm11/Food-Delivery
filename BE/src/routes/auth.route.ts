import { Router } from "express"
import { changePasswordAPI, createDriverAccountAPI, customerRegisterAPI, forgetPasswordAPI, loginAPI, logoutAPI, ownerRegisterAPI, refreshTokenAPI, resendOtpAPI, resetPasswordAPI, verifyOtpAPI } from "../controllers/auth.controller"
import { checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/login", loginAPI)
router.post("/refresh-token", refreshTokenAPI)
router.post("/customer/register", customerRegisterAPI)
router.post("/owner/register", ownerRegisterAPI)
router.post("/driver/register", createDriverAccountAPI)
router.post("/verify-otp", verifyOtpAPI)
router.post("/resend-otp", resendOtpAPI)
router.post("/forget-password", forgetPasswordAPI)
router.post("/reset-password", resetPasswordAPI)
router.post("/logout", checkValidJWT, logoutAPI)

router.patch("/change-password", checkValidJWT, changePasswordAPI)

export default router;