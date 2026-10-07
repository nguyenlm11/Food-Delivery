//đối soát doanh thu Restaurant
import mongoose from "mongoose"

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

export default RestaurantSettlement