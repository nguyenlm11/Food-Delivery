import { Router } from "express"
import { changePasswordAPI, customerRegisterAPI, deleteUserAPI, forgetPasswordAPI, getMeAPI, loginAPI, logoutAPI, ownerRegisterAPI, refreshTokenAPI, resendOtpAPI, resetPasswordAPI, restoreUserAPI, verifyOtpAPI } from "../controllers/auth.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.post("/login", loginAPI)
router.post("/staff-login", loginAPI)
router.post("/refresh-token", refreshTokenAPI)
router.post("/customer/register", customerRegisterAPI)
router.post("/owner/register", ownerRegisterAPI)
router.post("/verify-otp", verifyOtpAPI)
router.post("/resend-otp", resendOtpAPI)
router.post("/forget-password", forgetPasswordAPI)
router.post("/reset-password", resetPasswordAPI)
router.post("/logout", checkValidJWT, logoutAPI)

router.get("/me", checkValidJWT, getMeAPI)

router.patch("/change-password", checkValidJWT, changePasswordAPI)

router.delete("/users/:userId", checkValidJWT, checkRole("ADMIN"), deleteUserAPI)
router.patch("/users/:userId/restore", checkValidJWT, checkRole("ADMIN"), restoreUserAPI)

export default router;