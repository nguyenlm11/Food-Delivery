export interface BackendErrorResponse {
    success: false
    code: string
    message: string
    data: unknown
}

export type AdminAction = "approve" | "reject" | "delete" | "hide" | "restore" | "restoreDeleted" | "block" | "unblock"

export interface ActionTarget {
    id: string
    name: string
    action: AdminAction
    title: string
}

export interface ActionConfig {
    description: string
    message: string
    reasonLabel?: string
}
