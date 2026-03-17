import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

export const demoRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_123";

/**
 * Investor Demo Bypass
 * Returns a high-level operative token for instant dashboard access
 */
demoRouter.post("/login", async (req, res) => {
    try {
        // Find or create a 'Demo Investor' user
        let user = await User.findOne({ email: "investor@jobgenesis.demo" });
        
        if (!user) {
            user = await User.create({
                name: "Investor Operative",
                email: "investor@jobgenesis.demo",
                password: "demo_bypass_unsecure", // Not used for token generation here
                isVerified: true,
                skillTree: {
                    frontend: 85,
                    backend: 90,
                    systemDesign: 75,
                    security: 60,
                    algorithms: 95,
                    totalXP: 5000,
                    bountiesSolved: 12
                },
                badges: [
                    {
                        id: "neural_pioneer",
                        name: "Neural Pioneer",
                        description: "Earned 1000 total XP on the platform.",
                        icon: "🚀",
                        earnedAt: new Date()
                    },
                    {
                        id: "algorithm_god",
                        name: "Algorithm God",
                        description: "Reached 500 XP in algorithmic problem solving.",
                        icon: "🧠",
                        earnedAt: new Date()
                    }
                ]
            });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                skillTree: user.skillTree,
                badges: user.badges
            }
        });
    } catch (e) {
        console.error("Demo Logic Error:", e);
        res.status(500).json({ error: "DEMO_BYPASS_FAILED" });
    }
});
