import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        label: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        recipientName: {
            type: String,
            trim: true,
            maxlength: 100
        },

        recipientPhone: {
            type: String,
            trim: true,
            maxlength: 20
        },

        addressLine: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255
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
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
