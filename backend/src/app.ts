import express from "express";
import cors from "cors";
 
export const app = express();

/**
 * ✅ GLOBAL CORS — FIRST MIDDLEWARE
 * This MUST be before any routes
 */
app.use(
  cors({
    origin: "http://localhost:5173",
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

app.use("/api/health", healthRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/ai", aiRouter);
