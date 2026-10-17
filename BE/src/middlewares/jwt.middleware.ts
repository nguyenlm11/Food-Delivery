import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { AppError } from "../errors/AppError";

const checkValidJWT = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
    const secret = process.env.JWT_ACCESS_SECRET

    if (!token) {
        return next(new AppError("Unauthorized! Access token is missing!", 401, "AUTH_ACCESS_TOKEN_MISSING"))
    }

    if (!secret) {
        return next(new AppError("JWT_ACCESS_SECRET is not defined in server environment!", 500, "AUTH_ACCESS_TOKEN_SECRET_MISSING"))
    }

    let dataDecoded: any
    try {
        dataDecoded = jwt.verify(token, secret)
    } catch (error) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            return next(new AppError("Access token has expired!", 401, "AUTH_ACCESS_TOKEN_EXPIRED"))
        }

        if (error instanceof Error && error.name === "NotBeforeError") {
            return next(new AppError("Access token is not active yet!", 401, "AUTH_ACCESS_TOKEN_NOT_ACTIVE"))
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError("Invalid access token!", 401, "AUTH_ACCESS_TOKEN_INVALID"))
        }

        return next(error)
    }

    (req as any).user = {
        id: dataDecoded.id,
        fullname: dataDecoded.fullname,
        email: dataDecoded.email,
        role: dataDecoded.role
    }
    next()
}

const checkRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user

        if (!user || !user.role) {
            return next(new AppError("Unauthorized!", 401, "AUTHENTICATION_REQUIRED"))
        }

        if (!allowedRoles.includes(user.role)) {
            return next(new AppError("You don't have permission to perform this action!", 403, "AUTHORIZATION_FORBIDDEN"))
        }
        next()
    }
}

export { checkValidJWT, checkRole }