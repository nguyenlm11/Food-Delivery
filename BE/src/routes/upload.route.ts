import { Router } from "express"
import { getUploadSignatureAPI } from "../controllers/upload.controller"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"

const router = Router()

router.get("/signatures", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), getUploadSignatureAPI)

export default router
