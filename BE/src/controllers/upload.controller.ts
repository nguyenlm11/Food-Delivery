import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../errors/AppError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const getUploadSignatureAPI = async (req: Request, res: Response) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
        throw new AppError("Cloudinary upload configuration is incomplete!", 500, "UPLOAD_CONFIGURATION_MISSING")
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "foodie"
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        apiSecret
    )

    return res.status(200).json({
        timestamp,
        signature,
        folder,
        apiKey,
        cloudName,
    })
}