import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./db/connect";
import http from "http";
import { initializeSocket } from "./socketService";
import { setupWorker } from "./services/judge/queue";
import { SelfHealer } from "./services/ai/selfHealer";

const PORT = process.env.PORT || 4000;

// Initialize Auto-Healing Bot
const healer = new SelfHealer();
app.use(healer.expressErrorHandler);

function checkConfig() {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ CRITICAL ERROR: Missing environment variables:", missing.join(", "));
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

    const httpServer = http.createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`🔄 Socket.IO ready`);
    });
  } catch (err) {
    console.error("❌ BOOT FAILED:", err);
    process.exit(1);
  }
})();
