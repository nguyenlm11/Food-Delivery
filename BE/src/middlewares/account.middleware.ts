import { NextFunction, Request, Response } from "express"
import User from "../models/user.model"
import { AppError } from "../errors/AppError"

const checkActiveAccount = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id

        if (!userId) {
            return next(new AppError("Unauthorized!", 401, "AUTHENTICATION_REQUIRED"))
        }

        const user = await User.findById(userId).select("status").lean()

        if (!user) {
            return next(new AppError("User not found!", 404, "AUTH_USER_NOT_FOUND"))
        }

        if (user.status === "DELETED") {
            return next(new AppError("This account has been deleted!", 403, "AUTH_ACCOUNT_DELETED"))
        }

        if (user.status !== "ACTIVE") {
            return next(new AppError("The account doesn't have permission to perform this action!", 403, "AUTH_ACCOUNT_FORBIDDEN"))
        }

        next()
    }
    catch (error) {
        next(error)
    }
}

export { checkActiveAccount }
