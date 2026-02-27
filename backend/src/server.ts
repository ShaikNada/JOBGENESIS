import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./db/connect";
import { registerUser, loginUser, googleAuth, verifyEmail } from "./controllers/auth.controller";
import { matchJobs, analyzeGap, saveMissionResult, getUserMissions, analyzeTargetPath } from "./controllers/job.controller";
import { extractTextAndAnalyze, analyzePlainResumeText } from "./controllers/resume.controller";
import skillGapRouter from "./routes/skillGap.route";
import express from "express";
import http from "http";
import multer from "multer";
import { initializeSocket } from "./socketService";

const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 4000;

// Note: app.ts already uses /api/health, /api/problems, /api/ai (from routes/ai.route)
// We add auth and consolidate AI routes here.

// We will later wrap this Express app in a native http.Server so that
// socket.io can be attached to it. See startup logic at bottom.

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
jobRouter.post("/target-path", analyzeTargetPath);
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
app.use("/api/skill-gap", skillGapRouter);


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
