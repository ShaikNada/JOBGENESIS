import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./db/connect";
import { registerUser, loginUser, googleAuth, verifyEmail, getMe } from "./controllers/auth.controller";
import { matchJobs, analyzeGap, analyzeTargetPath, saveMissionResult, getUserMissions, startMission, updateMissionProgress } from "./controllers/job.controller";
import { processMissionForCAL } from "./services/ai/calService";
import { extractTextAndAnalyze, analyzePlainResumeText } from "./controllers/resume.controller";
import skillGapRouter from "./routes/skillGap.route";
import interviewRouter from "./routes/interview.route";
import assessmentRouter from "./routes/assessment.route";
import recruiterRouter from "./routes/recruiter.route";
import express from "express";
import http from "http";
import multer from "multer";
import { initializeSocket } from "./socketService";
import { globalLimiter, aiEndpointLimiter } from "./middleware/rateLimiter";
import { setupWorker } from "./services/judge/queue";

const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 4000;

// Note: app.ts already uses /api/health, /api/problems, /api/ai (from routes/ai.route)
// We add auth and consolidate AI routes here.

// We will later wrap this Express app in a native http.Server so that
// socket.io can be attached to it. See startup logic at bottom.

// Auth Routes
const authRouter = express.Router();

// Apply Global Rate Limiter to all auth/misc requests
app.use("/api/auth", globalLimiter, authRouter);


import { protect } from "./middleware/auth.middleware";

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/google", googleAuth);
authRouter.get("/verify-email/:token", verifyEmail);
authRouter.get("/me", protect, getMe);

// INTENTIONAL CRASH ROUTE FOR SELF-HEALER TESTING
authRouter.get("/crash", (req, res) => {
    // This will throw: Cannot read properties of undefined (reading 'length')
    const bug: any = undefined;
    const size = bug?.length ?? 0;
    res.json({ size });
});

// Job Routes
const jobRouter = express.Router();
jobRouter.post("/match", matchJobs);
jobRouter.post("/gap-analysis", analyzeGap);
jobRouter.post("/target-path", analyzeTargetPath);
jobRouter.post("/save-result", protect, saveMissionResult);
jobRouter.post("/start-mission", protect, startMission);
jobRouter.patch("/mission/:id/progress", protect, updateMissionProgress);
jobRouter.get("/history", protect, getUserMissions);

// AI / Resume Routes (matching frontend http://localhost:4000/api/ai/...)
const aiRouter = express.Router();
aiRouter.post("/match", matchJobs); // Some components might use /api/ai/match
aiRouter.post("/gap-analysis", analyzeGap);
aiRouter.post("/upload-resume", protect, upload.single("resume"), extractTextAndAnalyze);
aiRouter.post("/analyze-resume", protect, analyzePlainResumeText);

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/recruiter", recruiterRouter);
app.use("/api/ai", aiEndpointLimiter, aiRouter);
app.use("/api/skill-gap", aiEndpointLimiter, skillGapRouter);
app.use("/api/interview", aiEndpointLimiter, interviewRouter);
app.use("/api/assessment", aiEndpointLimiter, assessmentRouter);

import { SelfHealer } from "./services/ai/selfHealer";

// Initialize Auto-Healing Bot
const healer = new SelfHealer();

app.use(healer.expressErrorHandler);

// CRITICAL: Fail fast if config is missing
function checkConfig() {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ CRITICAL ERROR: Missing environment variables:", missing.join(", "));
    console.error("Please explicitly set these in your .env file.");
    process.exit(1);
  }
}

(async () => {
  try {
    checkConfig();
    console.log("📂 Connecting to Database...");
    await connectDB();
    console.log("👷 Starting BullMQ Background Worker...");
    setupWorker();

    // create http server wrapper so socket.io can piggyback
    const httpServer = http.createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`🔑 Identity Services Active`);
      console.log(`🔄 Socket.IO ready`);
    });
  } catch (err) {
    console.error("❌ BOOT FAILED:", err);
    process.exit(1);
  }
})();
