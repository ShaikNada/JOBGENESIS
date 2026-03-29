import { Router } from "express";
import mongoose from "mongoose";
import redisClient from "../db/redis";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redisStatus = redisClient ? (redisClient.status === "ready" ? "connected" : "connecting/error") : "disabled/fallback";

  const isHealthy = mongoStatus === "connected"; // Redis might be optional in some configs, but Mongo is critical

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    services: {
      database: mongoStatus,
      cache: redisStatus,
      backend: "healthy"
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
