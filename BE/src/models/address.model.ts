import mongoose from "mongoose"

const addressSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        label: {
            type: String,
            enum: ["HOME", "OFFICE"],
            default: "HOME",
            required: true
        },
        recipientName: {
            type: String,
            trim: true
        },
        recipientPhone: {
            type: String,
            trim: true
        },
        addressLine: {
            type: String,
            required: true,
            trim: true
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

addressSchema.index(
    { customerId: 1 },
    { unique: true, partialFilterExpression: { isDefault: true } }
)

const Address = mongoose.model("Address", addressSchema)

export default Address
