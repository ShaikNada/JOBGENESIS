import express from "express";
import cors from "cors";
import "./lib/firebase";

export const app = express();

/**
 * ✅ GLOBAL CORS — FIRST MIDDLEWARE
 * This MUST be before any routes
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173"] : "http://localhost:5173",
    credentials: true,
  })
);

/**
 * ✅ JSON parsing
 */
app.use(express.json());

/**
 * ✅ ROUTES (AFTER CORS)
 */
import { healthRouter } from "./routes/health.route";
import { problemsRouter } from "./routes/problems.route";
import { aiRouter } from "./routes/ai.route";
import { skillTreeRouter } from "./routes/skillTree.route";
import { authRouter } from "./routes/auth.route";
import { jobRouter } from "./routes/job.route";
import { resumeRouter } from "./routes/resume.route";
import skillGapRouter from "./routes/skillGap.route";
import interviewRouter from "./routes/interview.route";
import assessmentRouter from "./routes/assessment.route";
import recruiterRouter from "./routes/recruiter.route";
import { demoRouter } from "./routes/demo.route";
import { simulationRouter } from "./routes/simulation.route";
import { aiEndpointLimiter } from "./middleware/rateLimiter";

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/demo", demoRouter);
app.use("/api/simulation", simulationRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/ai", aiEndpointLimiter, aiRouter);
app.use("/api/skill-tree", skillTreeRouter);
app.use("/api/skill-gap", aiEndpointLimiter, skillGapRouter);
app.use("/api/interview", aiEndpointLimiter, interviewRouter);
app.use("/api/assessment", aiEndpointLimiter, assessmentRouter);
app.use("/api/recruiter", recruiterRouter);
