import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { AppError } from "../errors/error";

const checkValidJWT = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers["authorization"]
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
        const secret = process.env.JWT_ACCESS_SECRET

        if (!token) {
            throw new AppError("Unauthorized! Access token is missing!", 401);
        }

        if (!secret) {
            throw new AppError("JWT_ACCESS_SECRET is not defined in server environment!", 500)
        }

        const dataDecoded: any = jwt.verify(token, secret);

        (req as any).user = {
            id: dataDecoded.id,
            fullname: dataDecoded.fullname,
            email: dataDecoded.email,
            role: dataDecoded.role
        }
        next();
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode || 400).json({
                message: error.message
            })
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token has expired!"
            })
        }

        return res.status(401).json({
            message: "Invalid access token!"
        })
    }
}

const checkRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user

        if (!user || !user.role) {
            return next(new AppError("Unauthorized access!", 401))
        }

        if (!allowedRoles.includes(user.role)) {
            return next(new AppError("You don't have permission to perform this action!", 403))
        }
        next()
    }
}

export { checkValidJWT, checkRole }