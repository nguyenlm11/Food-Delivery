import bcrypt from "bcrypt";
import crypto from "crypto";

//Hash mật khẩu
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

//So sánh mật khẩu
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

//Tạo mật khẩu ngẫu nhiên
export const generatePassword = (length: number = 8): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = crypto.randomBytes(length);
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[bytes[i] % chars.length];
    }

    return password;
};

//Tạo OTP
export const generateOTP = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
};