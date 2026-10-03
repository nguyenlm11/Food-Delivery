import mongoose from "mongoose";

const driverLocationSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
            unique: true
        },
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        accuracy: {
            type: Number,
            default: null
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

const DriverLocation = mongoose.model("DriverLocation", driverLocationSchema)

export default DriverLocation