export interface BackendErrorResponse {
    success: false
    code: string
    message: string
    data: unknown
}

export type AdminAction = "approve" | "reject" | "delete" | "hide" | "restore"

export interface ActionTarget {
    id: string
    name: string
    action: AdminAction
}
