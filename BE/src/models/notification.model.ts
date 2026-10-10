import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["ORDER", "PAYMENT", "RESTAURANT", "DRIVER", "SYSTEM"],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    {
        timestamps: true
    }
)

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification