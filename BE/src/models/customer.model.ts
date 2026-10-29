import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        birthday: {
            type: Date
        },

        defaultAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
