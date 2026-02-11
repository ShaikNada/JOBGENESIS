import { Request, Response } from "express";
import { User } from "../models/User.model";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_123";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

        const user = await User.create({
            name,
            email,
            password,
            authProvider: "local",
            isVerified: isDev, // AUTO-VERIFY IN DEV
            verificationToken: isDev ? undefined : verificationToken,
        });

        if (user) {
            if (isDev) {
                return res.status(201).json({
                    message: "Identity protocol initiated. [DEV MODE: AUTO-VERIFIED]",
                    email: user.email,
                    isVerified: true
                });
            }

            // MOCK EMAIL LOG (STILL KEEP FOR PROD-LIKE TESTING)
            console.log("-----------------------------------------");
            console.log(`📧 VERIFICATION EMAIL SENT TO: ${email}`);
            console.log(`🔗 LINK: http://localhost:4000/api/auth/verify-email/${verificationToken}`);
            console.log("-----------------------------------------");

            res.status(201).json({
                message: "Registration successful. Please check your email to verify your identity.",
                email: user.email,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send("<h1>Verification Failed</h1><p>Invalid or expired token.</p>");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send("<h1>Verification Successful</h1><p>Your identity has been verified. You can now close this tab and log in.</p>");
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: "Email not verified. Please check your inbox." });
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Google OAuth
// @route   POST /api/auth/google
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: "Google Auth not configured" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google Token" });
        }

        let user = await User.findOne({ email: payload.email });

        if (!user) {
            // Create new user via Google
            user = await User.create({
                name: payload.name || "Google User",
                email: payload.email,
                googleId: payload.sub,
                avatar: payload.picture,
                authProvider: "google",
            });
        } else if (!user.googleId) {
            // Link existing account
            user.googleId = payload.sub;
            user.authProvider = "google"; // update or keep 'local' dual auth?
            await user.save();
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user.id),
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Google authentication failed", error });
    }
};
