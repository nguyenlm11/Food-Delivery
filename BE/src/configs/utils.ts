import bcrypt from "bcrypt";

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
}

const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
}

const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password;
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export { hashPassword, comparePassword, generateOTP, generatePassword }