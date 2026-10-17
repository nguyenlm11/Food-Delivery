import { NextFunction, Request, Response } from "express"
import { AppError } from "../errors/AppError"

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"))
}

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            code: error.code,
            message: error.message,
            ...(error.data === undefined ? {} : { data: error.data }),
        })
    }

    return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
    })
}

export { notFoundHandler, errorHandler }
