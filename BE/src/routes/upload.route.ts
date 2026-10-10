import { Router } from "express"
import { checkValidJWT } from "../middlewares/jwt.middleware"
import { getUploadSignatureAPI } from "../controllers/upload.controller";

const router = Router()

router.get("/signature", checkValidJWT, getUploadSignatureAPI);

export default router