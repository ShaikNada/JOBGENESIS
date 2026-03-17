import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn("⚠️ WARNING: JWT_SECRET is not defined in environment variables. Using unsafe default for development.");
}

const SECRET_KEY = JWT_SECRET || "dev_secret_key_123";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

            (req as any).user = await User.findById(decoded.id).select("-password");

            if (!(req as any).user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
