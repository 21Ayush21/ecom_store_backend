import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

interface UserPayload {
    id: string;
    email: string;
    role: "user" | "seller" | "admin";
}

export const generateAccessToken = (payload: UserPayload) =>{
    return jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: ACCESS_TOKEN_EXPIRY});
}

export const generateRefreshToken = (payload: UserPayload) =>{
    return jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: REFRESH_TOKEN_EXPIRY});
}

export const verifyToken = (token: string): UserPayload =>{
    return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
}

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return null;
    }

    return authHeader.split(' ')[1]
}