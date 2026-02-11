import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./db/connect";
import { registerUser, loginUser, googleAuth, verifyEmail } from "./controllers/auth.controller";
import { matchJobs, analyzeGap, saveMissionResult, getUserMissions } from "./controllers/job.controller";
import { extractTextAndAnalyze, analyzePlainResumeText } from "./controllers/resume.controller";
import express from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 4000;

// Note: app.ts already uses /api/health, /api/problems, /api/ai (from routes/ai.route)
// We add auth and consolidate AI routes here.

// Auth Routes
const authRouter = express.Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/google", googleAuth);
authRouter.get("/verify-email/:token", verifyEmail);

import { protect } from "./middleware/auth.middleware";

// Job Routes
const jobRouter = express.Router();
jobRouter.post("/match", matchJobs);
jobRouter.post("/gap-analysis", analyzeGap);
jobRouter.post("/save-result", protect, saveMissionResult);
jobRouter.get("/history", protect, getUserMissions);

// AI / Resume Routes (matching frontend http://localhost:4000/api/ai/...)
const aiRouter = express.Router();
aiRouter.post("/match", matchJobs); // Some components might use /api/ai/match
aiRouter.post("/gap-analysis", analyzeGap);
aiRouter.post("/upload-resume", upload.single("resume"), extractTextAndAnalyze);
aiRouter.post("/analyze-resume", analyzePlainResumeText);

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/ai", aiRouter);


(async () => {
  try {
    console.log("📂 Connecting to Database...");
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`🔑 Identity Services Active`);
    });
  } catch (err) {
    console.error("❌ BOOT FAILED:", err);
    process.exit(1);
  }
})();
