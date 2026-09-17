import bcrypt from "bcrypt"
import crypto from "crypto"
import User from "../models/user.model"

//Hash mật khẩu
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
}

//So sánh mật khẩu
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
}

//Tạo mật khẩu ngẫu nhiên
export const generatePassword = (length: number = 8): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = crypto.randomBytes(length);
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[bytes[i] % chars.length];
    }

    return password;
}

//Tạo OTP
export const generateOTP = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
}

//Tạo email
export const generateRestaurantEmail = async (restaurantName: string): Promise<string> => {
    const slug = restaurantName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "")

    const domain = "restaurant.com"
    let isUnique = false
    let email = ""

    while (!isUnique) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        email = `${slug}${randomSuffix}@${domain}`;
        const existingUser = await User.exists({ email });

        if (!existingUser) {
            isUnique = true
        }
    }

    return email;
};