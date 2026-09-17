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
        location: {
            type: [Number],
            required: true,
            index: "2dsphere"
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
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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