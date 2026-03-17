import { Request, Response } from "express";
import { User } from "../models/User.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import admin from "firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET;

// Initialize Firebase Admin SDK once (uses GOOGLE_APPLICATION_CREDENTIALS env variable OR
// FIREBASE_SERVICE_ACCOUNT_JSON env variable as JSON string for serverless platforms like Render)
if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("✅ Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_JSON");
        } else {
            // Falls back to Application Default Credentials (works on GCP/Firebase hosting)
            admin.initializeApp();
            console.log("✅ Firebase Admin initialized via Application Default Credentials");
        }
    } catch (e) {
        console.warn("⚠️ Firebase Admin init failed. Google auth will not work:", e);
    }
}

const generateToken = (id: string) => {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

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
            role: role === "recruiter" ? "recruiter" : "candidate",
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

            console.log("-----------------------------------------");
            console.log(`📧 VERIFICATION EMAIL SENT TO: ${email}`);
            console.log(`🔗 LINK: http://localhost:4000/api/auth/verify-email/${verificationToken}`);
            console.log("-----------------------------------------");

            res.status(201).json({
                message: "Registration successful. Please check your email to verify your identity.",
                email: user.email,
                role: user.role,
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
                role: user.role,
                resumeData: user.resumeData,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Firebase Google Auth (verifies Firebase ID token from frontend)
// @route   POST /api/auth/google
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token, role } = req.body;

        if (!token) {
            return res.status(400).json({ message: "No Firebase ID token provided" });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);

        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({ message: "Could not extract email from Firebase token" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user via Google / Firebase
            user = await User.create({
                name: name || "Google User",
                email,
                googleId: uid,
                avatar: picture,
                authProvider: "google",
                isVerified: true, // Firebase already verified the email
                role: role === "recruiter" ? "recruiter" : "candidate",
                password: crypto.randomBytes(32).toString("hex"), // random unusable password
            });
            console.log(`✅ New Firebase Google user created: ${email}`);
        } else if (!user.googleId) {
            // Link existing local account to Google
            user.googleId = uid;
            user.authProvider = "google";
            user.isVerified = true;
            await user.save();
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            resumeData: user.resumeData,
            token: generateToken(user.id),
        });

    } catch (error: any) {
        console.error("Firebase Auth Error:", error);
        if (error.code === "auth/id-token-expired") {
            return res.status(401).json({ message: "Firebase token expired. Please sign in again." });
        }
        if (error.code === "auth/argument-error" || error.code === "auth/invalid-id-token") {
            return res.status(401).json({ message: "Invalid Firebase token." });
        }
        res.status(401).json({ message: "Google authentication failed", error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user?._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
