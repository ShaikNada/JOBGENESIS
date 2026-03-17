import cluster from "cluster";
import os from "os";
import http from "http";
import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./db/connect";
import { initializeSocket } from "./socketService";
import { setupWorker } from "./services/judge/queue";
import { SelfHealer } from "./services/ai/selfHealer";

const PORT = Number(process.env.PORT) || 4000;
// In production (Render/Heroku/Vercel), we should cap workers to avoid memory exhaustion (512MB limit)
const maxWorkers = Number(process.env.WEB_CONCURRENCY) || Number(process.env.MAX_WORKERS) || 2;
const numCPUs = Math.min(os.cpus().length, maxWorkers);

function checkConfig() {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ CRITICAL ERROR: Missing environment variables:", missing.join(", "));
    process.exit(1);
  }
}

if (cluster.isPrimary) {
  console.log(`🚀 Primary process ${process.pid} is running`);
  console.log(`🧵 Spawning ${numCPUs} worker processes...`);

  checkConfig();

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(`🔴 Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Spawning replacement...`);
    cluster.fork();
  });

  // Handle graceful shutdown for primary
  const shutdown = () => {
    console.log("🛑 Primary received shutdown signal. Terminating workers...");
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

} else {
  // Workers handle HTTP and Socket connections
  (async () => {
    try {
      console.log(`📂 Worker ${process.pid}: Connecting to Database...`);
      await connectDB();
      
      console.log(`👷 Worker ${process.pid}: Starting BullMQ Background Worker...`);
      setupWorker();

      // Initialize Auto-Healing Bot per worker
      const healer = new SelfHealer();
      app.use(healer.expressErrorHandler);

      const httpServer = http.createServer(app);
      initializeSocket(httpServer);

      const server = httpServer.listen(PORT, () => {
        console.log(`🚀 Worker ${process.pid} running on http://localhost:${PORT}`);
      });

      // Graceful shutdown for worker
      const workerShutdown = () => {
        console.log(`🛑 Worker ${process.pid} shutting down...`);
        server.close(() => {
          console.log(`✅ Worker ${process.pid} offline.`);
          process.exit(0);
        });
      };

      process.on("SIGTERM", workerShutdown);
      process.on("SIGINT", workerShutdown);

    } catch (err) {
      console.error(`❌ Worker ${process.pid} startup failed:`, err);
      process.exit(1);
    }
  })();
}
