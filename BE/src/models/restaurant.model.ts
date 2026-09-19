import mongoose from "mongoose"

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        logoImage: {
            type: String,
            trim: true,
            default: ""
        },
        coverImage: {
            type: String,
            trim: true,
            default: ""
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },

        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        openTime: {
            type: String,
            default: "08:00",
            trim: true
        },
        closeTime: {
            type: String,
            default: "22:00",
            trim: true
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "CLOSED"],
            default: "INACTIVE",
            required: true
        },
        approvalStatus: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
            required: true
        },
        rejectionReason: {
            type: String,
            default: ""
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Owner",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

const Restaurant = mongoose.model("Restaurant", restaurantSchema)

export default Restaurant