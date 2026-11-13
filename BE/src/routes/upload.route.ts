import { Router } from "express"
import { checkRole, checkValidJWT } from "../middlewares/jwt.middleware"
import { getUploadSignatureAPI } from "../controllers/upload.controller";

const router = Router()

router.get("/signature", checkValidJWT, checkRole("ADMIN", "OWNER", "RESTAURANT"), getUploadSignatureAPI);

export default router