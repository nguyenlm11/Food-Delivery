const DEFAULT_ERROR_CODES: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
}

export class AppError extends Error {
    readonly statusCode: number
    readonly code: string
    readonly data?: any

    constructor(message: string, statusCode: number, code?: string, data?: any) {
        super(message)
        this.name = "AppError"
        this.statusCode = statusCode
        this.code = code ?? DEFAULT_ERROR_CODES[statusCode] ?? "INTERNAL_SERVER_ERROR"
        this.data = data
    }
}
