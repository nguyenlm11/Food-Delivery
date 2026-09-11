import mongoose, { mongo } from "mongoose";

const ownerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        businessName: {
            type: String,
            required: true,
            trim: true
        },
        taxCode: {
            type: String,
            trim: true,
            unique: true,
            sparse: true
        }
    },
    {
        timestamps: true
    }
)

const Owner = mongoose.model("Onwer", ownerSchema)

export default Owner