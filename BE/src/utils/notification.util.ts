import { getIO } from "../configs/socket"
import { handleCreateNotification } from "../services/notification.service"
import { CreateNotificationParams } from "../interfaces/notification.interface"

export const createAndEmitNotification = async (params: CreateNotificationParams) => {
    const notification = await handleCreateNotification(params)

    getIO()
        .to(`user:${params.userId}`)
        .emit("notification:new", notification)

    return notification
}

export const createNotificationsAndEmitToRoom = async (userIds: string[], room: string, params: Omit<CreateNotificationParams, "userId">) => {
    const notifications = []

    for (const userId of userIds) {
        const notification = await handleCreateNotification({
            userId,
            ...params
        })

        notifications.push(notification)
    }

    getIO()
        .to(room)
        .emit("notification:new", notifications)

    return notifications
}