import { Request, Response, NextFunction } from "express";
import admin from "../lib/firebase";
import { User } from "../models/User.model";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

            // Verify Firebase ID Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            if (!decodedToken.email) {
                return res.status(401).json({ message: "Not authorized, token invalid" });
            }

            // Find user in MongoDB by email
            const user = await User.findOne({ email: decodedToken.email }).select("-password");

            if (!user) {
                return res.status(401).json({ message: "Not authorized, user not found in database" });
            }

            (req as any).user = user;
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error: any) {
        console.error("Auth Middleware Error:", error);
        if (error.code === "auth/id-token-expired") {
            return res.status(401).json({ message: "Firebase token expired" });
        }
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
