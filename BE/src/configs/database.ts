import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Bypass lỗi phân giải DNS SRV của nhà mạng
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDatabase = async () => {
    try {
        const dbUri = process.env.MONGO_URL;

        if (!dbUri) {
            throw new Error("MONGO_URL variable is missing in .env file!");
        }

        const conn = await mongoose.connect(dbUri);
        console.log(`>>> DB Connected to Host: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

export default connectDatabase