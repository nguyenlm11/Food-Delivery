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
            enum: ["ACTIVE", "INACTIVE", "CLOSED", "DELETED"],
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
        commissionRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 20
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Owner",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

restaurantSchema.index(
    { userId: 1 },
    { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } }
)

const Restaurant = mongoose.model("Restaurant", restaurantSchema)

const restaurantCategorySchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        }
    },
    { timestamps: true }
)

restaurantCategorySchema.index({ restaurantId: 1, categoryId: 1 }, { unique: true })

const RestaurantCategory = mongoose.model("RestaurantCategory", restaurantCategorySchema)

//đối soát doanh thu Restaurant
const restaurantSettlementSchema = new mongoose.Schema(
    {
        // Đơn hàng
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true
        },

        // Restaurant nhận tiền
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        // Owner của Restaurant
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Owner",
            required: true
        },

        // Tổng tiền món ăn trước khi trừ discount/commission
        grossAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Discount do Restaurant chịu
        restaurantDiscountAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        // Doanh thu dùng để tính commission
        netSalesAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Snapshot commissionRate của Restaurant
        // tại thời điểm Order được hoàn thành
        commissionRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        // Số tiền Platform nhận
        commissionAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Số tiền Restaurant/Owner được nhận
        restaurantAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Trạng thái đối soát
        settlementStatus: {
            type: String,
            enum: [
                "PENDING",
                "COMPLETED",
                "CANCELLED",
                "REFUNDED"
            ],
            default: "PENDING"
        },
    },
    {
        timestamps: true
    }
)

const RestaurantSettlement = mongoose.model("RestaurantSettlement", restaurantSettlementSchema)

export { Restaurant, RestaurantCategory, RestaurantSettlement }
