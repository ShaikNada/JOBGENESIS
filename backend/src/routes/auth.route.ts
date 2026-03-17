import { Router } from "express";
import { registerUser, loginUser, googleAuth, verifyEmail, getMe } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { globalLimiter } from "../middleware/rateLimiter";

export const authRouter = Router();

authRouter.post("/register", globalLimiter, registerUser);
authRouter.post("/login", globalLimiter, loginUser);
authRouter.post("/google", globalLimiter, googleAuth);
authRouter.get("/verify-email/:token", verifyEmail);
authRouter.get("/me", protect as any, getMe);
