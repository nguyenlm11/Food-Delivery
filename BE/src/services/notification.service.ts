import mongoose from "mongoose"
import { CreateNotificationParams } from "../interfaces/interface"
import Notification from "../models/notification.model"
import { AppError } from "../errors/AppError"

const handleCreateNotification = async (params: CreateNotificationParams) => {
    const { userId, type, title, message, data } = params

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid ID format!", 400, "NOTIFICATION_INVALID_USER_ID")
    }

    if (!type || !title || !message) {
        throw new AppError("Missing required field!", 400, "NOTIFICATION_REQUIRED_FIELDS")
    }

    const notification = await Notification.create({
        userId: userId,
        type: type,
        title: title,
        message: message,
        data: data ?? null
    })

    return notification
}

export { handleCreateNotification }