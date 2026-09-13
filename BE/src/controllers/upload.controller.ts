import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getUploadSignatureAPI = async (req: Request, res: Response) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = "owner_docs"; // Thư mục gom nhóm ảnh (CCCD, Giấy phép)

        // Sinh chữ ký bảo mật dựa trên timestamp và folder
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET!
        );

        return res.status(200).json({
            timestamp,
            signature,
            folder,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: error.message || "Failed to generate upload signature"
        });
    }
};