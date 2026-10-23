import mongoose from "mongoose"

const shipFeeSchema = new mongoose.Schema(
    {
        ruleType: {
            type: String,
            enum: ["BASE_FEE", "PEAK_HOUR", "WEEKEND", "HOLIDAY", "WEATHER"],
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        baseFee: {
            type: Number,
            default: 0
        },
        perKmFee: {
            type: Number,
            default: 0
        },
        multiplier: {
            type: Number,
            default: 1.0
        },
        startTime: {
            type: String,
            default: null
        },
        endTime: {
            type: String,
            default: null
        },
        specialDate: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

const ShipFee = mongoose.model("ShipFee", shipFeeSchema)

export default ShipFee