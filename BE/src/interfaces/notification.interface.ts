interface CreateNotificationParams {
    userId: string
    type: "ORDER" | "PAYMENT" | "RESTAURANT" | "DRIVER" | "SYSTEM"
    title: string
    message: string
    data?: any
}

export { CreateNotificationParams }
